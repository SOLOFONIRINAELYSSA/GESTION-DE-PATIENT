import { useEffect, useState } from 'react';
import { Patient, getAllPatients } from '../../../services/patients_api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './listPatient.css'

const listPatientDashbord = () => {
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const data = await getAllPatients();
      setPatients(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la récupération des patients');
    }
  };

  return (
    <>
      <div className="head">
          <h3 style={{ color: '#bdb9b9' }}>Liste des patients</h3>
          <i className='bx bx-search icon-tbl'></i>
          <i className='bx bx-filter icon-tbl'></i>
      </div>
      <div className="place-table">
        <table className='table-dashbord'>
          <thead className="thead-dashbord">
            <tr className='tr-dashbord'>
              <th>CIN</th>
              <th>Prenom</th>
              <th>Age</th>
              <th>Sexe</th>
              <th>Telephone</th>
            </tr>
          </thead>
          <tbody className="tbody-dashbord">
            {patients.length > 0 ? (
              patients.map((patient) => (
                <tr className='tr-dashbord' key={patient.cinPatient}>
                  <td>{patient.cinPatient}</td>
                  <td>{patient.prenom}</td>
                  <td>{patient.age}</td>
                  <td>{patient.sexe}</td>
                  <td>{patient.telephone || '-'}</td>
                </tr>
              ))
            ) : (
              <tr className='-dashbord'>
                <td colSpan={5} style={{ textAlign: 'center' }}>
                  Aucun patient trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default listPatientDashbord;