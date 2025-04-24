

const ListSuivi = () => {
  
    return (
        <section id="content">
          <main>
            <div className="head-title">
              <div className="left">
                <h1 className='h1'>Suivi d'un patient</h1>
                <ul className="breadcrumb">
                  <li><a href="#">Suivi</a></li>
                  <li><i className='bx bx-chevron-right'></i></li>
                  <li><a className="active" href="/listSuivi">Liste des suivis</a></li>
                </ul>
              </div>
              <a href="/imprimerSuivi" className="btn-download">
                <i className='bx bx-plus'></i>
                <span className="text">Imprimer tout</span>
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
                      <th>Date de suivi</th>
                      <th>Nom du patient </th>
                      <th>Nom et specialiste du praticien</th>
                      <th>Compte rendu</th>
                      <th>Type de la prescription</th>
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

export default ListSuivi
