

const ListConsultation = () => {

    return (
        <section id="content">
          <main>
            <div className="head-title">
              <div className="left">
                <h1 className='h1'>Consultation des patients</h1>
                <ul className="breadcrumb">
                  <li><a href="#">Consultation</a></li>
                  <li><i className='bx bx-chevron-right'></i></li>
                  <li><a className="active" href="/listConsultation">Liste des dérnieres consultations</a></li>
                </ul>
              </div>
              <a href="/ajoutConsultation" className="btn-download">
                <i className='bx bx-plus'></i>
                <span className="text">AJOUTER</span>
              </a>
            </div>
    
            <div className="table-date">
              <div className="orber">
                <div className="head">
                  <h3></h3>
                  <i className='bx bx-search icon-tbl'></i>
                  <i className='bx bx-filter icon-tbl'></i>
                </div>
                <table>
                  <thead className="thead">
                    <tr>
                      <th>Rendez-vous</th>
                      <th>Date de la consultation</th>
                      <th>Compte rendu</th>
                    </tr>
                  </thead>
                  <tbody className="tbody">
                    {/* Ligne vide avec message */}
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center' }}>
                        Aucune donnée disponible
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </section>
      );
}

export default ListConsultation
