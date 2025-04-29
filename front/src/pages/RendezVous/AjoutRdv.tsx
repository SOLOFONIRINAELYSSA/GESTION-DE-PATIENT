import SidBar from "../../components/SidBarNavBar/SidBar"
import ContainerRdv from "../../components/Container/ContainerRendezVous/AjoutRdv"
import { GoMoveToTop } from "react-icons/go";

const AjoutRdv = () => {
  return (
    <div>
        <SidBar />
        <ContainerRdv />
        <section id="content">
          <footer className="footer">
              <div className="footer-text">
                  <p>&copy; 2025 G-PATIENT | tous Droits Réservés.</p>
              </div>

              <div className="footer-iconTop">
                  <a onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  <GoMoveToTop />
                  </a>
              </div>
          </footer>
        </section>
    </div>
  )
}

export default AjoutRdv