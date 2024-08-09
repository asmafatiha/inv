// invoiceTemplate.js


// date conversion to dd/mm/yyyy form
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  //dead line payment date calculation 
  const calculateDeadlineDate = (invoiceDate, deadlineOption) => {
    const date = new Date(invoiceDate);
    switch (deadlineOption) {
      case 'cash':
        return formatDate(date);
      case '8 days':
        date.setDate(date.getDate() + 8);
        return formatDate(date);
      case 'to the 1st':
        date.setMonth(date.getMonth() + 1);
        date.setDate(1);
        return formatDate(date);
      case 'to the 1st plus one month':
        date.setMonth(date.getMonth() + 2);
        date.setDate(1);
        return formatDate(date);
      default:
        return formatDate(date); // Default to invoice date if no match
    }
  };
  
  // html template css included
  module.exports = (invoice, lines, totalAmount) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice</title>
    <style>
      body {
        margin: 30px;
        border-radius: 10px;
        border: solid 1px gray;
        padding: 25px;
      }
      
      .info-table {
        width: 100%;
        margin-top: 20px;
        border-collapse: collapse;
      }
  
      .companyInfo {
        text-align: right;
        line-height: 0.6;
      }
      
      .title {
        text-align: center;
        font-size: 50px;
        font-weight: bold;
        padding-top: 20px;
      }
      
      .clientInfo,
      .invoiceInfo {
        width: 50%;
        padding: 10px;
      }
      
      .clientInfo {
        text-align: left;
        line-height: 0.6;
      }
      
      .invoiceInfo {
        text-align: right;
        line-height: 0.6;
      }
      
      .table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
        clear: both;
      }
  
      .mainRow {
        height: 50px;
        border-top: solid 3.5px black;
        border-bottom: solid 3.5px black;
      }
      
      .table th,
      .table td {
        padding: 8px;
        text-align: center;
      }
      
      .total {
        font-weight: bold;
        margin-top: 20px;
      }
      .footer {
        margin-top: 100px;
        margin-left: 5px;
        width: 100%;
      }
      .depassement {
        font-size: 15px;
        text-align: center;
      }
      .important {
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div class="companyInfo">
      <p>Marokko Biz SARL</p>
      <p>9 Rue 10 Diar V Montagne</p>
      <p>90000 Tanger</p>
      <p>Patente N: 127407</p>
      <p>Banque: AttijariwafaBank</p>
      <p>Compte N: 00764000413370000286061</p>
    </div>
    <div class="title">FACTURE</div>
    <table class="info-table">
      <tr>
        <td class="clientInfo">
          <p>Client : ${invoice.client_name}</p>
          <p>Adresse : ${invoice.client_address}</p>
          <p>${invoice.client_city}</p>
          <p>ZIP : ${invoice.client_zip}</p>
          <p>CIN/Patent : ${invoice.cin_patent}</p>
        </td>
        <td class="invoiceInfo">
          <p>Facture N° : ${invoice.invoice_id}</p>
          <p>Date de Facturation : ${formatDate(invoice.invoice_date)}</p>
          <p>Date d'échéance : ${calculateDeadlineDate(invoice.invoice_date, invoice.deadLineDate)}</p>
        </td>
      </tr>
    </table>
    <table class="table">
      <tr class="mainRow">
        <th>Article</th>
        <th>Quantité</th>
        <th>Prix Unitaire</th>
        <th>Total</th>
      </tr>
      ${lines.map(line => `
        <tr>
          <td>${line.item_text}</td>
          <td>${line.quantity}</td>
          <td>${line.price.toFixed(2)}</td>
          <td>${line.total.toFixed(2)}</td>
        </tr>
      `).join('')}
    </table>
    <table class= "footer">
      <tr>
        <td>Totaux</td>
        <td></td>
        <td></td>
        <td>${totalAmount.toFixed(2)}</td>
      </tr>
      <tr class="TVA">
      <td>TVA</td>
      <td>0%</td>
      <td></td>
      <td>-</td>
    </tr>
      <tr class="subtotal">
      <td>Subtotal</td>
      <td><p>A régler sur le compte : 00764000413370000286061 avant le : </p></td>
      <td></td>
      <td>${totalAmount.toFixed(2)}</td>
    </tr>
    <tr><td class="important" colspan="4"><p>Veuillez indiquer le numéro de facture sur le paiement                       N° FACTURE : ${invoice.invoice_id}</p></td></tr>
    </table>
    <div class="depassement"><p>En cas de dépassement du délai de paiement, des frais de rappel de 500,00 MAD seront imposés</p></div>
  </body>
  </html>`;
  