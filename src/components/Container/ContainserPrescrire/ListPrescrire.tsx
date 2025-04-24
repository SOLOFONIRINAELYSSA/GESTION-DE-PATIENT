

const ListPrescrire = () => {
  
    return (
        <section id="content">
          <main>
            <div className="head-title">
              <div className="left">
                <h1 className='h1'>Prescription d'une consulation du patient</h1>
                <ul className="breadcrumb">
                  <li><a href="#">Prescrire</a></li>
                  <li><i className='bx bx-chevron-right'></i></li>
                  <li><a className="active" href="/listPrescrire">Liste des prescriptions</a></li>
                </ul>
              </div>
              <a href="/ajoutPrescrire" className="btn-download">
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
                      <th>Date de la prescription</th>
                      <th>ID consultation</th>
                      <th>Type de la prescription</th>
                      <th>Posologie</th>
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

export default ListPrescrire
