import React, { Suspense, Fragment } from "react";

const infiniteThenable = { then() {} };

function Suspender({ freeze, children }) {
  if (freeze) {
    throw infiniteThenable;
  }
  return <Fragment>{children}</Fragment>;
}
 
export default function Freeze({ freeze, children, placeholder = null }) {
  return (
    <Suspense fallback={placeholder}>
      <Suspender freeze={freeze}>{children}</Suspender>
    </Suspense>
  );
}