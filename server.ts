import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import path from 'path';

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Store active orders
  const orders = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('place_order', (orderData) => {
      const orderId = orderData.id;
      console.log('Order placed:', orderId);
      
      const order = {
        ...orderData,
        status: 'processing',
        socketId: socket.id
      };
      
      orders.set(orderId, order);
      socket.join(orderId);

      // Notify restaurants
      io.to('restaurants').emit('new_order', order);

      // Fallback auto-simulation if no restaurant handles it (optional)
      // For now, we'll keep the auto-simulation but allow manual overrides
      setTimeout(() => updateStatus(orderId, 'confirmed'), 2000);
    });

    socket.on('join_restaurant', () => {
      socket.join('restaurants');
      // Send current active orders
      socket.emit('active_orders', Array.from(orders.values()));
    });

    socket.on('update_order_status', ({ orderId, status }) => {
      updateStatus(orderId, status);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  function updateStatus(orderId: string, status: string) {
    const order = orders.get(orderId);
    if (order) {
      order.status = status;
      io.to(orderId).emit('order_update', { orderId, status });
      console.log(`Order ${orderId} updated to ${status}`);
      
      if (status === 'delivered') {
        orders.delete(orderId);
      }
    }
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
