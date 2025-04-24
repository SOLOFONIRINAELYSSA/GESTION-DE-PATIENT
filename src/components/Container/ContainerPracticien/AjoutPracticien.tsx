import '../ContainerPracticien/AjoutPracticien.css'
import React from 'react'


const AjoutPracticien = () => {
  
    return (
        <section id="content">
            <main>
                <div className="head-title">
                    <div className="left">
                        <h1 className='h1'>Formulaire</h1>
                        <ul className="breadcrumb">
                            <li><a href="#">Praticien</a></li>
                            <li><i className='bx bx-chevron-right'></i></li>
                            <li><a className="active" href="/listPraticien">Liste des praticien(ne)s</a></li>
                            <li><i className='bx bx-chevron-right'></i></li>
                            <li><a className="active" href="/ajoutPraticien">Ajout de praticien(ne)</a></li>
                        </ul>
                    </div>
                </div>

                <div className="table-date">
                    <div className="orber">
                        <div className="form-conge">
                            <form action="${pageContext.request.contextPath}/ServletLivres" method="POST">

                                <div className="form first">
                                    <div className="details personal">
                                        <span className="title">Détail du praticien(ne)</span>

                                        <div className="fields">
                                            <div className="input-field-div">
                                                <label>CIN</label>                                                
                                                <input name="cinPraticien" type="text" placeholder="CIN du praticien(ne)" required />
                                            </div>
                                            <div className="input-field-div">
                                                <label>Nom</label>
                                                <input name="nom"  type="text" placeholder="nom du praticien(ne)" required />
                                            </div>
                                        </div>

                                        <div className="fields">
                                            <div className="input-field-div">
                                                <label>Prenom</label>                                                
                                                <input name="prenom" type="text" placeholder="prenom du praticien(ne)" required />
                                            </div>
                                            <div className="input-field-div">
                                                <label>Téléphone</label>
                                                <input name="telephone"  type="text" placeholder="numero du telephone"  required />
                                            </div>
                                        </div>

                                        <div className="fields">
                                            <div className="input-field-div">
                                                <label>Email</label>
                                                <input name="email" type="mail" placeholder="adresse email"  required />
                                            </div>
                                            <div className="input-field-div">
                                                <label>Specialiste</label>                                                
                                                <input name="specialiste"  type="text" placeholder="specialité du praticien(ne)" required />
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

}

export default AjoutPracticien
