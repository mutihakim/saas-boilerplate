import{j as t}from"./app-DJ9lNZKt.js";import{P as e}from"./Prism-5k6_z9Xj.js";const i=`
<Rating
initialRating={3}
emptySymbol="mdi mdi-star-outline text-muted "
fullSymbol="mdi mdi-star text-warning "
/>
`,d=()=>t.jsx(e,{code:i,language:"html",plugins:["line-numbers"]}),m=`
<Rating
initialRating={1.5}
fractions={2}
emptySymbol="mdi mdi-star-outline text-muted "
fullSymbol="mdi mdi-star text-warning "
/>
`,u=()=>t.jsx(e,{code:m,language:"html",plugins:["line-numbers"]}),n=`
<Rating
emptySymbol="mdi mdi-star-outline text-muted "
fullSymbol="mdi mdi-star text-warning "
/>
`,g=()=>t.jsx(e,{code:n,language:"html",plugins:["line-numbers"]}),s=`
<Rating
stop={16}
emptySymbol="mdi mdi-star-outline text-muted fa-1x"
fullSymbol="mdi mdi-star text-warning"
initialRating={4.5}
readonly
/>
`,c=()=>t.jsx(e,{code:s,language:"html",plugins:["line-numbers"]}),a=`
const [customize, setcustomize] = useState("");

<Rating
stop={5}
emptySymbol="mdi mdi-star-outline text-muted "
fullSymbol="mdi mdi-star text-warning "
onChange={(customize) => setcustomize(customize)}
/>
`,x=()=>t.jsx(e,{code:a,language:"html",plugins:["line-numbers"]}),o=`
const [reset, setreset] = useState("");

<Rating
emptySymbol="mdi mdi-star-outline text-muted"
fullSymbol={reset}
onHover={() => setreset("mdi mdi-star text-warning")}
/>
`,p=()=>t.jsx(e,{code:o,language:"html",plugins:["line-numbers"]});export{d as BasicRaterExample,g as CustomMsgExample,x as OnHoverExample,u as RaterWithStepExample,c as ReadOnlyRaterExample,p as ReasetRaterExample};
