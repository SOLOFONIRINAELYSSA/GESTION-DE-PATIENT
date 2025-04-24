// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import '../ContainerListPatient/ajoutPatient.css';


const AjoutPatient = () => {
  

    return (
        <section id="content">
            <main>
                <div className="head-title">
                    <div className="left">
                        <h1 className='h1'>Formulaire</h1>
                        <ul className="breadcrumb">
                            <li><a href="#">Patient</a></li>
                            <li><i className='bx bx-chevron-right'></i></li>
                            <li><a className="active" href="/listPatient">Liste des patients</a></li>
                            <li><i className='bx bx-chevron-right'></i></li>
                            <li><a className="active" href="/ajoutPatient">Ajout de patient</a></li>
                        </ul>
                    </div>
                </div>

                <div className="table-date">
                    <div className="orber">
                        <div className="form-conge">
                            <form action="${pageContext.request.contextPath}/ServletLivres" method="POST">

                                <div className="form first">
                                    <div className="details personal">
                                        <span className="title">Détail du patient</span>

                                        <div className="fields">
                                            <div className="input-field-div">
                                                <label>CIN</label>                                                
                                                <input name="cinPatient" type="text" placeholder="CIN du patient" required />
                                            </div>
                                            <div className="input-field-div">
                                                <label>Nom</label>
                                                <input name="nom"  type="text" placeholder="nom du patient" required />
                                            </div>
                                        </div>

                                        <div className="fields">
                                            <div className="input-field-div">
                                                <label>Prenom</label>                                                
                                                <input name="prenom" type="text" placeholder="prenom du patient" required />
                                            </div>
                                            <div className="input-field-div">
                                                <label>Age</label>
                                                <input name="age"  type="number" placeholder="age"  required />
                                            </div>
                                        </div>

                                        <div className="fields">
                                            <div className="input-field-div">
                                                <label>Sexe</label>                                                
                                                <input name="sexe" type="text" placeholder="sexe" required />
                                            </div>
                                            <div className="input-field-div">
                                                <label>Adresse</label>
                                                <input name="adresse" type="number" placeholder="adresse"  required />
                                            </div>
                                        </div>

                                        <div className="fields">
                                            <div className="input-field-div">
                                                <label>Télephone</label>                                                
                                                <input name="telephone"  type="text" placeholder=" numero du telephone" required />
                                            </div>
                                            <div className="input-field-div">
                                                <label>Email</label>
                                                <input name="email" type="mail" placeholder="adresse email"  required />
                                            </div>
                                        </div>

                                        <div className="fields">
                                            <button type="submit" className="nextBtn">
                                                <i className='bx bxs-download'></i> &nbsp; &nbsp;
                                                <span className="btnText">ENREGISTRER</span>
                                            </button>
                                            <button type="submit" className="nextBtn" id='btnAnnuler'>
                                                <i className='bx bxs-x-circle'></i> &nbsp; &nbsp;
                                                <span className="btnText">ANNULER</span>
                                            </button>
                                        </div>
                                        
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </section>
    );
};

export default AjoutPatient;