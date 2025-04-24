import '../../Container/ContainerRendezVous/ContainerRdv.css'

const ListRdv = () => {

  return (
    <section id="content">
      <main>
        <div className="head-title">
          <div className="left">
            <h1 className='h1'>Liste des rendez-vous</h1>
            <ul className="breadcrumb">
              <li><a href="#">Rendez-vous</a></li>
              <li><i className='bx bx-chevron-right'></i></li>
              <li><a className="active" href="/listRdv">Liste des dérnieres rendez-vous</a></li>
            </ul>
          </div>
          <a href="/ajoutRdv" className="btn-download">
            <i className='bx bx-plus'></i>
            <span className="text">AJOUTER</span>
          </a>
        </div>

        <div className="table-date">
          <div className="orber">
            <div className="head">
              <h3>Dernières Patients</h3>
              <i className='bx bx-search icon-tbl'></i>
              <i className='bx bx-filter icon-tbl'></i>
            </div>
            <table>
              <thead className="thead">
                <tr>
                  <th>Nom Patient</th>
                  <th>Nom du Praticien</th>
                  <th>Date et heure</th>
                  <th>Statut</th>
                  <th>Praticien particulier</th>
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

export default ListRdv
