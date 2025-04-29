import '../ContainerParametres/ContainerParametres.css'

import Parametre from '../../../assets/images/parametre.svg'

const ContainerParametres = () => {
  return (
    <>
        <section id="content">
            <main>
                <div className="head-title">
                    <div className="left">
                        <h1 className='h1'>PARAMETRES</h1>
                        <ul className="breadcrumb">
                            <li>
                                <a href="#">Appartement</a>
                            </li>
                            <li><i className='bx bx-chevron-right' ></i></li>
                            <li>
                                <a className="active" href="/parametres">Paramètres</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="table-date">
                    <div className="todo">
                        <div className="img">
                            <img src={Parametre} alt="" />
                        </div>
                    </div>
                </div>
            </main>
        </section>
    </>
  )
}

export default ContainerParametres