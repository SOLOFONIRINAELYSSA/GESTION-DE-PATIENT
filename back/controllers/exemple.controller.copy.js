import pool from "../config/db.config.js"

async function create(req, res) {
    try{

        const {  design, loyer } = req.body;

        if(!design || !loyer){
            return res.status(400).json({ error: "Designation ou Loyer invalide" });
        }

        await pool.query(
            "INSERT INTO appartements (design, loyer) values (?, ?)", [design, loyer]
        );

        return res.status(201).json({ message: "Appartement ajout avec succes"});

    }catch(error){

        return res.status(500).json({ error: "Il y a une erreur serveur: " + error });

    }
}

async function updateOne(req, res) {
    try{

        const {  design, loyer } = req.body;

        const {  numApp } = req.params;

        if(!design || !loyer){
            return res.status(400).json({ error: "Designation ou Loyer invalide" });
        }

        await pool.query(
            "UPDATE appartements set design=?, loyer=? where numApp=? ", [design, loyer, numApp]
        );

        return res.status(200).json({ message: "Appartement modifié avec succes"});

    }catch(error){

        return res.status(500).json({ error: "Il y a une erreur serveur: " + error });

    }
}

async function deleteOne(req, res) {
    try{

        const {  numApp } = req.params;

        await pool.query(
            "DELETE FROM appartements WHERE numApp=?", [numApp]
        );

        return res.status(200).json({ message: "Suppession avec succes"});

    }catch(error){

        return res.status(500).json({ error: "Il y a une erreur serveur: " + error });

    }
}

async function getAll(req, res) {
    try{

        const [result] = await pool.query(
            "SELECT * FROM appartements"
        );

        return res.status(200).json({result});

    }catch(error){

        return res.status(500).json({ error: "Il y a une erreur serveur: " + error });

    }
}

export default {
    create,
    updateOne,
    deleteOne,
    getAll
}