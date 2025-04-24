

const AjoutConsultation = () => {
 
    return (
        <section id="content">
            <main>
                <div className="head-title">
                    <div className="left">
                        <h1 className='h1'> Formulaire de la nouvelle consultation </h1>
                        <ul className="breadcrumb">
                            <li><a href="#">Consultation</a></li>
                            <li><i className='bx bx-chevron-right'></i></li>
                            <li><a className="active" href="/listConsultation">Liste des consultations </a></li>
                            <li><i className='bx bx-chevron-right'></i></li>
                            <li><a className="active" href="/ajoutConsultation">Nouvel rendez vous</a></li>
                        </ul>
                    </div>
                </div>

                <div className="table-date">
                    <div className="orber">
                        <div className="form-conge">
                            <form action="${pageContext.request.contextPath}/ServletLivres" method="POST">

                                <div className="form first">
                                    <div className="details personal">
                                        <span className="title">Détail de la consultation</span>

                                            <div className="input-field-div">
                                                <label>ID rendez-vous</label>                                                
                                                <input name="idRdv" type="number" placeholder="id du rendez-vous" required />
                                            </div>
                                            <div className="input-field-div">
                                                <label>Date de la consultation</label>
                                                <input name="dateConsult"  type="text" placeholder="date et heure de la consultation" required />
                                            </div>
                                            <div className="input-field-div">
                                                <label>Compte rendu</label>                                                
                                                <input name="compteRendu" type="textarea" placeholder="compte rendu" required />
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

export default AjoutConsultation
