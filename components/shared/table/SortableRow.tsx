// 'use client';

// import React from 'react';
// import { useSortable } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';

// export default function SortableRow(props: any) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
//     id: props['data-row-key'],
//   });

//   const style = {
//     ...props.style,
//     transform: CSS.Transform.toString(transform),
//     transition,
//     ...(isDragging && {
//       position: 'relative',
//       zIndex: 9999,
//     }),
//   };

//   const children = React.Children.map(props.children, (child: any, index) => {
//     // First column = drag handle
//     if (index === 0) {
//       return React.cloneElement(child, {
//         ...child.props,
//         children: (
//           <div
//             {...attributes}
//             {...listeners}
//             style={{
//               cursor: 'grab',
//               display: 'flex',
//               justifyContent: 'center',
//               alignItems: 'center',
//               width: '100%',
//               height: '100%',
//             }}
//           >
//             {child.props.children}
//           </div>
//         ),
//       });
//     }

//     return child;
//   });

//   return (
//     <tr {...props} ref={setNodeRef} style={style}>
//       {children}
//     </tr>
//   );
// }

'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SortableRow(props: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props['data-row-key'],
  });

  const style = {
    ...props.style,
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging && {
      position: 'relative',
      zIndex: 9999,
    }),
  };

  const children = React.Children.map(props.children, (child: any, index) => {
    if (index === 0) {
      return React.cloneElement(child, {
        ...child.props,
        children: (
          <div
            {...attributes}
            {...listeners}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'grab',
              width: '100%',
              height: '100%',
            }}
          >
            {child.props.children}
          </div>
        ),
      });
    }

    return child;
  });

  return (
    <tr {...props} ref={setNodeRef} style={style}>
      {children}
    </tr>
  );
}