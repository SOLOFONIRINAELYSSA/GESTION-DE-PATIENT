import React from 'react';
import '../ContainerHome/ContainerHome.css';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { PieChart } from '@mui/x-charts/PieChart';
import { useNavigate } from 'react-router-dom';

const ContainerHome = () => {
    const navigate = useNavigate();
    const [radius, setRadius] = React.useState<number>(50);
    const [skipAnimation, setSkipAnimation] = React.useState<boolean>(false);

    const handleRadius = (event: Event, newValue: number | number[]) => {
        if (typeof newValue !== 'number') return;
        setRadius(newValue);
    };

    return (
        <section id="content">
            <main>
                <div className="head-title">
                    <div className="left">
                        <h1>Tableau de bord</h1>
                        <ul className="breadcrumb">
                            <li><a href="#">Appartements</a></li>
                            <li><i className='bx bx-chevron-right'></i></li>
                            <li><a className="active" href="/">Tableau de bord</a></li>
                        </ul>
                    </div>
                    <a href="" className="btn-download">
                        <i className='bx bx-plus'></i>
                        <span className="text">AJOUTER</span>
                    </a>
                </div>

                <ul className="box-info">
                    <li>
                        <i className='bx bxs-calendar-check'></i>
                        <span className="text">
                            <h3 className="txt-box-top">0</h3>
                            <p className="txt-box-bottom">Total Des Loyers</p>
                        </span>
                    </li>
                    <li>
                        <i className='bx bxs-coin-stack'></i>
                        <span className="text">
                            <h3 className="txt-box-top">0</h3>
                            <p className="txt-box-bottom">Loyer Maximal</p>
                        </span>
                    </li>
                    <li>
                        <i className='bx bxs-dollar-circle'></i>
                        <span className="text">
                            <h3 className="txt-box-top">0</h3>
                            <p className="txt-box-bottom">Loyer Minimal</p>
                        </span>
                    </li>
                </ul>

                <div className="table-date">
                    <div className="orber">
                        <div className="head">
                            <h3>Derniers Appartements</h3>
                            <div className="search-filter">
                                <i className='bx bx-search icon-tbl'></i>
                                <i className='bx bx-filter icon-tbl'></i>
                            </div>
                        </div>
                        <table>
                            <thead className="thead">
                                <tr>
                                    <th>Nom Appartement</th>
                                    <th>Loyer</th>
                                    <th>Obs</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="tbody">
                                {/* Lignes vides */}
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center' }}>
                                        Aucune donnée disponible
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="todo">
                        <Box className="chart">
                            <Typography variant="h6" gutterBottom>
                                Répartition des Loyers
                            </Typography>
                            <PieChart
                                series={[
                                    {
                                        data: [
                                            { id: 0, value: 0, label: 'Maximal' },
                                            { id: 1, value: 0, label: 'Minimal' },
                                            { id: 2, value: 0, label: 'Total' },
                                        ],
                                        innerRadius: radius,
                                        arcLabel: (params) => `${params.value}`,
                                        arcLabelMinAngle: 20,
                                    },
                                ]}
                                width={400}
                                height={270}
                                skipAnimation={skipAnimation}
                            />
                            <div className="chart-controls">
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={skipAnimation}
                                            onChange={(e) => setSkipAnimation(e.target.checked)}
                                        />
                                    }
                                    label="Passer l'animation"
                                />
                                <Typography id="input-radius" gutterBottom>
                                    Rayon intérieur
                                </Typography>
                                <Slider
                                    value={radius}
                                    onChange={handleRadius}
                                    valueLabelDisplay="auto"
                                    min={15}
                                    max={100}
                                />
                            </div>
                        </Box>
                    </div>
                </div>
            </main>
        </section>
    );
};

export default ContainerHome;