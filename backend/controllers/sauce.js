const Sauce = require('../models/Sauce');
const fs = require ('fs');

//Creation of a sauce
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete req.body._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !'}))
        .catch(error => res.status(400).json({ error }));
};

//Editing a sauce
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : {...req.body};

    Sauce.updateOne({ _id: req.params.id}, { ...req.body, _id: req.params.id})
        .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
        .catch(error => res.status(400).json({ error }));
};

//Removing a sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
                .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));  
};

//Display a sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

//Show all sauces
exports.getAllSauce = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

//Love or Hate a sauce
exports.like = (req, res, next) => {
    const userId = req.body.userId;
    const like = req.body.like;
    
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            //Love sauce
            if(like === 1) {
                if(!sauce.usersLiked.includes(userId)) {
                    sauce.likes++;
                    sauce.usersLiked.push(userId);
                    sauce.save()
                        .then(() => res.status(201).json({message: 'Vous aimez cette sauce !'}))
                        .catch(error => res.status(400).json({ error }));
                } else {
                    res.status(403).json({ message: 'Vous ne pouvez pas aimé de nouveau cette sauce !'})
                }       
            } else if(like === -1) {
                //Hate sauce
                if(!sauce.usersDisliked.includes(userId)) {
                    sauce.dislikes++;
                    sauce.usersDisliked.push(userId);
                    sauce.save()
                        .then(() => res.status(201).json({message: "Vous n'aimez pas cette sauce !"}))
                        .catch(error => res.status(400).json({ error }));
                } else {
                    res.status(403).json({ message: 'Vous ne pouvez pas détester de nouveau cette sauce !'})
                }
            } else if(like === 0) {
                //Remove Like
                if(sauce.usersLiked.includes(userId) && sauce.likes > 0) {
                    sauce.likes--;
                    sauce.save()
                        .then(() => res.status(200).json({message: "Vous n'aimez plus cette sauce !"}))
                        .catch(error => res.status(400).json({ error }));
                } else if(sauce.usersDisliked.includes(userId) && sauce.dislikes > 0) {
                    //Remove Dislike
                    sauce.dislikes--;
                    sauce.save()
                        .then(() => res.status(200).json({message: "Vous ne détestez plus cette sauce !"}))
                        .catch(error => res.status(400).json({ error }));
                } else {
                    res.status(403).json({message: "Vous ne pouvez plus agir avec cette sauce !"});
                };
            };
        })
        .catch(error => res.status(500).json({ error }));
};

