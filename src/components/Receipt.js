import { money } from './Layout';

// Hidden on screen; shown only when printing (see .receipt-print in index.css).
// Sized for a 58mm thermal roll.
export default function Receipt({ order, items }) {
  return (
    <div className="receipt-print">
      <div style={{ textAlign: 'center' }}>
        <strong>RESTRO POS</strong><br />
        Small Restaurant<br />
        --------------------------------
      </div>
      <div>
        Order #: {order?.id ?? '—'}<br />
        {new Date(order?.created_at || Date.now()).toLocaleString()}
      </div>
      <div>--------------------------------</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td>{i.qty} x {i.name}</td>
              <td style={{ textAlign: 'right' }}>{money(i.price * i.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>--------------------------------</div>
      <table style={{ width: '100%' }}>
        <tbody>
          <tr>
            <td><strong>TOTAL</strong></td>
            <td style={{ textAlign: 'right' }}>
              <strong>{money(items.reduce((s, i) => s + i.price * i.qty, 0))}</strong>
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ textAlign: 'center', marginTop: 6 }}>
        Thank you! Visit again
      </div>
    </div>
  );
}
