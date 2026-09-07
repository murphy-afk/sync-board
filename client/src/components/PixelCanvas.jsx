import React, { useState, useEffect } from 'react';
import { FiTrash2, FiCheck, FiDownload, FiImage, FiEdit3, FiMaximize2, FiX, FiAlertTriangle } from 'react-icons/fi';

const PASTEL_COLORS = [
    '#000000', '#78716c', '#fecdd3', '#fed7aa', 
    '#fef08a', '#bbf7d0', '#bae6fd', '#c7d2fe', '#f3e8ff'
];

const GRID_SIZE = 16;
const COUPLE_ID = 1;

export default function PixelCanvas() {
    const [grid, setGrid] = useState(Array(GRID_SIZE * GRID_SIZE).fill('#FAF7F2'));
    const [selectedColor, setSelectedColor] = useState('#78716c');
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [savedMessage, setSavedMessage] = useState(false);
    const [gallery, setGallery] = useState([]);
    const [view, setView] = useState('canvas');
    const [expandedDoodle, setExpandedDoodle] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    useEffect(() => {
        fetchDoodles();
    }, []);

    const fetchDoodles = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/doodles/${COUPLE_ID}`);
            const data = await res.json();
            const formatted = data.map(item => ({
                id: item.id,
                grid: typeof item.grid_data === 'string' ? JSON.parse(item.grid_data) : item.grid_data,
                timestamp: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            setGallery(formatted);
        } catch (err) {
            console.error('Error fetching doodles:', err);
        }
    };

    const handlePixelClick = (index) => {
        const newGrid = [...grid];
        newGrid[index] = selectedColor;
        setGrid(newGrid);
    };

    const handleMouseEnter = (index) => { if (isMouseDown) handlePixelClick(index); };
    const clearCanvas = () => setGrid(Array(GRID_SIZE * GRID_SIZE).fill('#FAF7F2'));

    const saveDrawing = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/doodles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coupleId: COUPLE_ID, gridData: grid })
            });

            if (response.ok) {
                fetchDoodles();
                setSavedMessage(true);
                setTimeout(() => setSavedMessage(false), 2500);
            }
        } catch (err) {
            console.error('Error saving doodle:', err);
        }
    };

    const deleteDoodle = async (id, e) => {
        e.stopPropagation();
        try {
            const response = await fetch(`http://localhost:5000/api/doodles/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setGallery(gallery.filter(item => item.id !== id));
                setConfirmDeleteId(null);
            }
        } catch (err) {
            console.error('Error deleting doodle:', err);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-[#FAF7F2] p-8 rounded-4xl border border-stone-200/60 shadow-md flex flex-col items-center relative">
            <div className="flex items-center gap-2 mb-6 bg-[#F3EDE2] p-1.5 rounded-full border border-stone-200/60">
                <button onClick={() => setView('canvas')} className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition cursor-pointer ${view === 'canvas' ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}><FiEdit3 /> Canvas</button>
                <button onClick={() => setView('gallery')} className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition cursor-pointer ${view === 'gallery' ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}><FiImage /> Gallery ({gallery.length})</button>
            </div>

            {view === 'canvas' ? (
                <>
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-light text-stone-800">Shared Pixel Canvas</h2>
                        <p className="text-stone-500 text-sm mt-1">Draw a little something to leave on each other's board.</p>
                    </div>

                    <div className="w-full max-w-95 bg-white p-3 rounded-2xl shadow-inner border border-stone-200/60">
                        <div className="grid gap-0.5 bg-stone-300 p-1 rounded-xl select-none" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }} onMouseDown={() => setIsMouseDown(true)} onMouseUp={() => setIsMouseDown(false)} onMouseLeave={() => setIsMouseDown(false)}>
                            {grid.map((color, index) => (
                                <div key={index} className="aspect-square cursor-pointer transition-colors duration-75 rounded-xs" style={{ backgroundColor: color }} onMouseDown={() => handlePixelClick(index)} onMouseEnter={() => handleMouseEnter(index)} />
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between w-full mt-8 gap-4 px-2">
                        <div className="flex items-center gap-2 bg-[#F3EDE2] p-2 rounded-2xl border border-stone-200/60">
                            {PASTEL_COLORS.map((color) => (
                                <button key={color} className={`w-7 h-7 rounded-full transition-transform ${selectedColor === color ? 'scale-110 ring-2 ring-stone-400' : 'hover:scale-105'}`} style={{ backgroundColor: color }} onClick={() => setSelectedColor(color)} />
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={clearCanvas} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-sm font-medium transition cursor-pointer"><FiTrash2 /> Clear</button>
                            <button onClick={saveDrawing} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-100/70 hover:bg-emerald-100 text-emerald-800 text-sm font-medium transition cursor-pointer">
                                {savedMessage ? <FiCheck className="text-emerald-700" /> : <FiDownload />} {savedMessage ? 'Saved!' : 'Save Doodle'}
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="w-full">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-light text-stone-800">Doodle Gallery</h2>
                        <p className="text-stone-500 text-sm mt-1">Saved masterpieces from your board. Click any to expand.</p>
                    </div>
                    {gallery.length === 0 ? (
                        <div className="text-center py-16 text-stone-400 text-sm">No saved doodles yet. Head over to the canvas to create one!</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-100 overflow-y-auto pr-2">
                            {gallery.map((item) => (
                                <div key={item.id} onClick={() => setExpandedDoodle(item)} className="bg-white p-4 rounded-2xl border border-stone-200/60 shadow-sm flex flex-col items-center cursor-pointer hover:border-stone-400 transition group relative">
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition flex items-center gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(item.id); }} className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition" title="Delete doodle">
                                            <FiTrash2 className="text-sm" />
                                        </button>
                                    </div>

                                    {/* Inline Delete Confirmation Overlay */}
                                    {confirmDeleteId === item.id && (
                                        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-2xs rounded-2xl flex flex-col items-center justify-center p-4 z-10 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                                            <FiAlertTriangle className="text-amber-300 text-2xl mb-2" />
                                            <p className="text-xs text-white text-center font-medium mb-4">Delete this doodle?</p>
                                            <div className="flex items-center gap-2">
                                                <button onClick={(e) => deleteDoodle(item.id, e)} className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition cursor-pointer">Yes, delete</button>
                                                <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }} className="px-3 py-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-white text-xs font-medium transition cursor-pointer">Cancel</button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="w-full max-w-45 bg-stone-200 p-1 rounded-xl mb-3">
                                        <div className="grid gap-[0.5px]" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
                                            {item.grid.map((c, i) => (
                                                <div key={i} className="aspect-square rounded-2xs" style={{ backgroundColor: c }} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between w-full px-2 text-xs text-stone-400 font-mono">
                                        <span>Saved at {item.timestamp}</span>
                                        <FiMaximize2 className="text-stone-400 group-hover:text-stone-700 transition" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Expanded Modal View */}
            {expandedDoodle && (
                <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={() => setExpandedDoodle(null)}>
                    <div className="bg-[#FAF7F2] p-8 rounded-4xl border border-stone-200 shadow-2xl flex flex-col items-center max-w-sm w-full relative" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setExpandedDoodle(null)} className="absolute top-6 right-6 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition cursor-pointer">
                            <FiX className="text-lg" />
                        </button>
                        <h3 className="text-xl font-light text-stone-800 mb-6">Doodle View</h3>
                        
                        <div className="w-full max-w-70 bg-white p-3 rounded-2xl shadow-inner mb-6 border border-stone-200/60">
                            <div className="grid gap-px bg-stone-300 p-1 rounded-xl select-none" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
                                {expandedDoodle.grid.map((c, i) => (
                                    <div key={i} className="aspect-square rounded-xs" style={{ backgroundColor: c }} />
                                ))}
                            </div>
                        </div>

                        <span className="text-xs text-stone-400 font-mono">Saved at {expandedDoodle.timestamp}</span>
                    </div>
                </div>
            )}
        </div>
    );
}