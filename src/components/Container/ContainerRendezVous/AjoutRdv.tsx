import '../../Container/ContainerRendezVous/ContainerRdv.css'

const AjoutRdv = () => {

    return (
        <section id="content">
            <main>
                <div className="head-title">
                    <div className="left">
                        <h1 className='h1'>Prendre un rendez-vous! <i className='bx bx-happy'></i> </h1>
                        <ul className="breadcrumb">
                            <li><a href="#">Rendz-vous</a></li>
                            <li><i className='bx bx-chevron-right'></i></li>
                            <li><a className="active" href="/listRdv">Liste des dérnieres rendez-vous</a></li>
                            <li><i className='bx bx-chevron-right'></i></li>
                            <li><a className="active" href="/ajoutRdv">Nouvel rendez vous</a></li>
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
                                                <label>Nom du patient</label>                                                
                                                <input name="nomPatient" type="text" placeholder="nom du patient" required />
                                            </div>
                                            <div className="input-field-div">
                                                <label>Nom du praticien</label>
                                                <input name="nomPraticien"  type="text" placeholder="nom du praticien" required />
                                            </div>
                                        </div>

                                        <div className="fields">
                                            <div className="input-field-div">
                                                <label>Date et heure</label>                                                
                                                <input name="dateHeure" type="date" placeholder="date et heure du rendez-vous" required />
                                            </div>
                                            <div className="input-field-div">
                                                <label>Statut</label>
                                                <input name="statut"  type="text" placeholder="statut" />
                                            </div>
                                        </div>

                                            <div className="input-field-div">
                                                <label>Nom du praticien speciale</label>
                                                <input name="nomPraticien" type="text" placeholder="praticien en cas particulier" />
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

export default AjoutRdv
