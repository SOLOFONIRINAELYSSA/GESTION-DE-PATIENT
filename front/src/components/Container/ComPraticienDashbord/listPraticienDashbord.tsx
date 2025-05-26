import { useState, useEffect } from 'react';
import { Praticien, getAllPraticiens} from '../../../services/praticiens_api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './listPraticien.css'


const listPraticienDashbord = () => {
        const [praticiens, setPraticiens] = useState<Praticien[]>([]);

        useEffect(() => {
            fetchPraticiens();
        }, []);

        const fetchPraticiens = async () => {
            try {
            const data = await getAllPraticiens();
            setPraticiens(data);
            } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
            toast.error('Erreur lors du chargement des praticiens');
            } finally {
            setLoading(false);
            }
        };

  return (
    <>
      <div className="head">
          <h3 style={{ color: '#bdb9b9' }}>Liste des praticiens</h3>
          <i className='bx bx-search icon-tbl'></i>
          <i className='bx bx-filter icon-tbl'></i>
      </div>
      <div className="place-table">
        <table className='table-dashbord'>
          <thead className="thead-dashbord">
            <tr className='tr-dashbord'>
              <th>CIN</th>
              <th>Prenom</th>
              <th>Specialite</th>
            </tr>
          </thead>
          <tbody className="tbody-dashbord">
                         {praticiens.length > 0 ? (
                            praticiens.map((praticien) => (
                              <tr className='tr-dashbord' key={praticien.cinPraticien}>
                                <td>{praticien.cinPraticien}</td>
                                <td>Dr. {praticien.prenom}</td>
                                <td>{praticien.specialite || '-'}</td>
                               </tr>
                            ))
                          ) : (
                            <tr className='-dashbord'>
                              <td colSpan={4} style={{ textAlign: 'center' }}>
                                Aucun praticien trouvé
                              </td>
                            </tr>
                          )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default listPraticienDashbord
