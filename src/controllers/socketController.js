const socketIo = require('socket.io');

module.exports.initiateSocket = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);
        socket.on('joinRoom', (userId) => {
            socket.join(userId);
            console.log('User joined room:', userId);
        })
        socket.on('message', (data) => {
            console.log('Message received:', data);
            io.to(data.receiver).emit('message', data);
        });
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
    return io;
}