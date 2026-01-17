
import { Invoice, BusinessProfile, Customer } from '../types';

export const generateTallyXML = (invoice: Invoice, profile: BusinessProfile, customer?: Customer) => {
  const dateStr = invoice.date.split('T')[0].replace(/-/g, '');
  
  const xml = `<?xml version="1.0"?>
<ENVELOPE>
 <HEADER>
  <TALLYREQUEST>Import Data</TALLYREQUEST>
 </HEADER>
 <BODY>
  <IMPORTDATA>
   <REQUESTDESC>
    <REPORTNAME>Vouchers</REPORTNAME>
   </REQUESTDESC>
   <REQUESTDATA>
    <TALLYMESSAGE xmlns:UDF="TallyUDF">
     <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Accounting Voucher View">
      <DATE>${dateStr}</DATE>
      <VOUCHERNUMBER>${invoice.invoiceNumber}</VOUCHERNUMBER>
      <PARTYLEDGERNAME>${customer?.name || 'Cash'}</PARTYLEDGERNAME>
      <PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>
      <ALLLEDGERENTRIES.LIST>
       <LEDGERNAME>${customer?.name || 'Cash'}</LEDGERNAME>
       <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
       <AMOUNT>-${invoice.grandTotal}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
      <ALLLEDGERENTRIES.LIST>
       <LEDGERNAME>Sales Account</LEDGERNAME>
       <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
       <AMOUNT>${invoice.subtotal}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
      <ALLLEDGERENTRIES.LIST>
       <LEDGERNAME>GST Output</LEDGERNAME>
       <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
       <AMOUNT>${invoice.taxTotal}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
     </VOUCHER>
    </TALLYMESSAGE>
   </REQUESTDATA>
  </IMPORTDATA>
 </BODY>
</ENVELOPE>`;

  return xml;
};

export const downloadTallyFile = (invoice: Invoice, profile: BusinessProfile, customer?: Customer) => {
  const xmlContent = generateTallyXML(invoice, profile, customer);
  const blob = new Blob([xmlContent], { type: 'text/xml' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${invoice.invoiceNumber}_Tally.xml`;
  link.click();
  window.URL.revokeObjectURL(url);
};
