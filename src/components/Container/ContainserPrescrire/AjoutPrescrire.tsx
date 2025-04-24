

const AjoutPrescrire = () => {
 
    return (
        <section id="content">
            <main>
                <div className="head-title">
                    <div className="left">
                        <h1 className='h1'> Données à completer pour la prescription </h1>
                        <ul className="breadcrumb">
                            <li><a href="#">Prescrire</a></li>
                            <li><i className='bx bx-chevron-right'></i></li>
                            <li><a className="active" href="/listPrescrire">Liste des prescriptions </a></li>
                            <li><i className='bx bx-chevron-right'></i></li>
                            <li><a className="active" href="/ajoutPrescrire">Nouvelle prescription</a></li>
                        </ul>
                    </div>
                </div>

                <div className="table-date">
                    <div className="orber">
                        <div className="form-conge">
                            <form action="${pageContext.request.contextPath}/ServletLivres" method="POST">

                                <div className="form first">
                                    <div className="details personal">
                                        <span className="title">Ajouter de nouvelle prescription</span>

                                            <div className="input-field-div">
                                                <label>ID consultation</label>                                                
                                                <input name="idConsult" type="number" placeholder="id du consultation" required />
                                            </div>
                                            <div className="input-field-div">
                                                <label>Type de la prescription</label>
                                                <input name="typePrescrire"  type="text" placeholder="type de la precription" required />
                                            </div>
                                            <div className="input-field-div">
                                                <label>Posologie</label>                                                
                                                <input name="posologie" type="text" placeholder="posologie" required />
                                            </div>
                                            <div className="input-field-div">
                                                <label>Date de la prescription</label>                                                
                                                <input name="datePrescrire" type="date" placeholder="date de la prescription" required />
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

export default AjoutPrescrire
