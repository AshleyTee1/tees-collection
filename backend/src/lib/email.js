const nodemailer = require('nodemailer')

function getTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  })
}

async function sendOrderConfirmation(to, order) {
  if (!process.env.EMAIL_USER) return
  const transport = getTransport()
  await transport.sendMail({
    from: `"Tee's Collection" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Order Confirmed — ${order.reference_number}`,
    html: `
      <h2>Thank you for your order!</h2>
      <p>Your order reference number is: <strong>${order.reference_number}</strong></p>
      <p>Payment method: <strong>${order.payment_method === 'ecocash' ? 'EcoCash' : 'Cash on Collection'}</strong></p>
      <p>We will be in touch once your payment is verified.</p>
      <p>— Tee's Collection, Harare</p>
    `,
  })
}

async function sendAdminAlert(order) {
  if (!process.env.ADMIN_EMAIL || !process.env.EMAIL_USER) return
  const transport = getTransport()
  await transport.sendMail({
    from: `"Tee's Collection" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New Order — ${order.reference_number}`,
    html: `
      <h2>New order received</h2>
      <p>Reference: <strong>${order.reference_number}</strong></p>
      <p>Payment: ${order.payment_method}</p>
      <p>Total: $${(order.subtotal_usd + order.shipping_cost).toFixed(2)}</p>
      ${order.ecocash_receipt_url ? `<p>Receipt uploaded — verify in dashboard.</p>` : ''}
    `,
  })
}

async function sendCustomOrderAlert(customOrder) {
  if (!process.env.ADMIN_EMAIL || !process.env.EMAIL_USER) return
  const transport = getTransport()
  await transport.sendMail({
    from: `"Tee's Collection" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `Custom Order Request from ${customOrder.name}`,
    html: `
      <h2>New custom order request</h2>
      <p><strong>From:</strong> ${customOrder.name} (${customOrder.city || 'n/a'})</p>
      <p><strong>Contact:</strong> ${customOrder.contact_method} — ${customOrder.contact_value}</p>
      <p><strong>Category:</strong> ${customOrder.category || 'n/a'}</p>
      <p><strong>Quantity:</strong> ${customOrder.quantity || 'n/a'}</p>
      <p><strong>Description:</strong> ${customOrder.description}</p>
    `,
  })
}

module.exports = { sendOrderConfirmation, sendAdminAlert, sendCustomOrderAlert }
