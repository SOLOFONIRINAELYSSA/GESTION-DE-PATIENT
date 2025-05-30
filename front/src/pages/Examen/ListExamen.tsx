import SidBar from "../../components/SidBarNavBar/SidBar"
import ContainerExamens from "../../components/Container/ContainerExamens/listExamen"
import { GoMoveToTop } from "react-icons/go";

const ListExamens = () => {
  return (
    <div>
        <SidBar />
        <ContainerExamens />
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

export default ListExamens