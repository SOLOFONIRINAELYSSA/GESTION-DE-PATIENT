import { GoMoveToTop } from "react-icons/go";


import ContainerHome from "../../components/Container/ContainerHome/ContainerHome"
import SidBar from "../../components/SidBarNavBar/SidBar"

const Home = () => {
  return (
    <div>
        <SidBar />
        <ContainerHome />

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

export default Home