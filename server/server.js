require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');

const app = express();

app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post('/create-payment-intent', async (req, res) => {
  try {
    const valor = Number(req.body.valor);
    const moeda = req.body.moeda || 'brl';

    if (!Number.isInteger(valor) || valor <= 0) {
      return res.status(400).json({
        error: 'Valor inválido',
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: valor,
      currency: moeda,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Erro ao criar PaymentIntent:', error);

    res.status(500).json({
      error: 'Erro ao criar pagamento',
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Backend Stripe rodando na porta 3000');
});