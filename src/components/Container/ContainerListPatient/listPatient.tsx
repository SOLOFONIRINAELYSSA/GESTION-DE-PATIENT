import React from 'react';
// import { useNavigate } from 'react-router-dom';
import '../ContainerListPatient/listPatient.css';
// import ImgTable from '../../../assets/images/lo.ico';

const ListPatient = () => {
 

  return (
    <section id="content">
      <main>
        <div className="head-title">
          <div className="left">
            <h1 className='h1'>Liste des patients</h1>
            <ul className="breadcrumb">
              <li><a href="#">Patient</a></li>
              <li><i className='bx bx-chevron-right'></i></li>
              <li><a className="active" href="/listPatient">Liste des patients</a></li>
            </ul>
          </div>
          <a href="/ajoutPatient" className="btn-download">
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
              {/* <a href="#" className="notification">
                <i className="bx bxs-bell"></i>
                <span className="num">0</span>
             </a> */}
            </div>
            <table>
              <thead className="thead">
                <tr>
                  <th>Nom Patient</th>
                  <th>Ages</th>
                  <th>Sexe</th>
                  <th>Adresse</th>
                  <th>Email</th>
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

export default ListPatient;