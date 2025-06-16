import { importTransactions } from './importTransactions.js';
import { transactionsData } from './transactionsData.js';

// Función principal asíncrona
async function main() {
  try {
    console.log('Iniciando importación de transacciones...');
    console.log(`Número de transacciones a importar: ${transactionsData.length}`);
    
    if (transactionsData.length === 0) {
      console.log('No hay transacciones para importar.');
      return;
    }
    
    console.log('Primera transacción:', JSON.stringify(transactionsData[0], null, 2));
    
    await importTransactions(transactionsData);
    console.log('¡Importación completada con éxito!');
  } catch (error) {
    console.error('Error durante la importación:');
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar la función principal
main();
