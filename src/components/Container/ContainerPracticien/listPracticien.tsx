import React from 'react'

const listPracticien = () => {
 
  return (
    <section id="content">
      <main>
        <div className="head-title">
          <div className="left">
            <h1 className='h1'>Détail des praticiens</h1>
            <ul className="breadcrumb">
              <li><a href="#">Praticien</a></li>
              <li><i className='bx bx-chevron-right'></i></li>
              <li><a className="active" href="/listPraticien">Liste des praticiens</a></li>
            </ul>
          </div>
          <a href="/ajoutPraticien" className="btn-download">
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
                  <th>Nom du Praticien(ne)</th>
                  <th>Télephone</th>
                  <th>Email</th>
                  <th>Specialiste</th>
                  <th>Actions</th>
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

        <div className="table-date">
          <div className="orber">
            <div className="en-bas-du-tableau">
              <p>Total Des Loyers: <span>0</span></p>
              <p>Loyer Maximal: <span>0</span></p>
              <p>Loyer Minimal: <span>0</span></p>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
};



export default listPracticien

