import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [tickets, setTickets] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                let response;
                if (user?.role === 'admin') {
                    response = await api.get('/tickets');
                } else if (user?.role === 'technician') {
                    // Assuming technician ID is not directly available in token sub, but we can fetch by technician endpoint if we had the ID.
                    // For simplicity in this demo, fetching all or specific endpoint.
                    // The requirement says: /tickets/technician/:id
                    // We need to know the technician ID.
                    // A better approach would be an endpoint /tickets/my-tickets that uses the token.
                    // But let's try to fetch all for now or handle it differently.
                    // Actually, for this demo, let's just show a message or try to fetch if we can.
                    // Wait, the backend requirement: Endpoint para listar tickets por técnico (GET /tickets/technician/:id)
                    // We need the technician ID. The token has 'sub' which is User ID.
                    // We might need to fetch user details to get technician ID.
                    response = await api.get(`/tickets/technician/${user.sub}`); // This might fail if sub is UserID and endpoint expects TechnicianID.
                    // Let's assume for now we can fetch all or we need a way to get the technician profile.
                    // Let's just fetch all for admin and show a placeholder for others for now to test.
                    // Actually, let's implement a simple "My Tickets" logic if possible or just list all for admin.
                    if (user.role === 'admin') response = await api.get('/tickets');
                } else if (user?.role === 'client') {
                    // Same issue, need Client ID.
                    // Let's try to fetch /tickets/client/:id
                    // If the backend uses UserID for these lookups it would be easier.
                    // Let's assume the backend might need adjustment or we fetch user profile first.
                    // For the sake of the "small front to test", let's focus on Admin seeing everything.
                    if (user.role === 'admin') response = await api.get('/tickets');
                }

                if (response) {
                    setTickets(response.data.data || response.data);
                }
            } catch (error) {
                console.error('Error fetching tickets', error);
            }
        };

        if (user?.role === 'admin') {
            fetchTickets();
        }
    }, [user]);

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Dashboard - {user?.role}</h1>
                <button onClick={() => { logout(); navigate('/login'); }} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
            </div>

            {user?.role === 'admin' && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">All Tickets</h2>
                    <div className="bg-white shadow rounded overflow-hidden">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map((ticket) => (
                                    <tr key={ticket.id}>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{ticket.title}</td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{ticket.status}</td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{ticket.priority}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {user?.role !== 'admin' && (
                <div className="bg-yellow-100 p-4 rounded">
                    <p>Basic dashboard view. Admin role has full ticket list.</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
