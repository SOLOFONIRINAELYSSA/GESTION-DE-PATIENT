import SidBar from "../../components/SidBarNavBar/SidBar"
import ContainerListsAppartement from "../../components/Container/ContainerListPatient/listPatient"
import { GoMoveToTop } from "react-icons/go";

const ListPatient = () => {
  return (
    <div>
        <SidBar />
        <ContainerListsAppartement />
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

export default ListPatient