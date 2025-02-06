import React from 'react'
import GenericTable3 from './GenericTable3';
import GenericTable4 from './GenericTable4';
import TableDemo from './ATableDemo';
import GenericTable5 from './GenericTable5';
import StaticTableDemo from './StaticTable';
// import TableDemo from './TableDemo';

const AGEx = () => {
    const columnDefs = [
    { field: 'name' },
    { field: 'age' }
  ];
  
  const rowData = [
    { name: 'John', age: 30 },
    { name: 'Jane', age: 25 }
  ];
  return (
    // <GenericTable4
    //   columnDefs={[
    //     { headerName: 'ID', field: 'id', filter: 'agNumberColumnFilter' },
    //     { headerName: 'Title', field: 'title', filter: 'agTextColumnFilter' },
    //     { headerName: 'Body', field: 'body', filter: 'agTextColumnFilter' }
    //   ]}
    //   serverSide={true}
    //   apiUrl="https://jsonplaceholder.typicode.com/posts"
    //   paginationPageSize={20}
    // />
//     <GenericTable4
//     columnDefs={[
//         { headerName: 'ID', field: 'id', filter: 'agNumberColumnFilter' },
//         { headerName: 'Title', field: 'title', filter: 'agTextColumnFilter' },
//         { headerName: 'Body', field: 'body', filter: 'agTextColumnFilter' }
//       ]}
//   serverSide={true}
//   apiUrl="https://jsonplaceholder.typicode.com/posts"
//   paginationPageSize={20}
//   fetchDataParams={{ sort: 'desc' }}
// />
<TableDemo />

  
//   <GenericTable5
//     columnDefs={columnDefs}
//     rowData={rowData}
//     paginationPageSize={10}
//   />
//<StaticTableDemo />

  )
}

export default AGEx;
