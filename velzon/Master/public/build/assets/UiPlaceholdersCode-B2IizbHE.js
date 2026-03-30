import{j as a}from"./app-DJ9lNZKt.js";import{P as l}from"./Prism-5k6_z9Xj.js";const e=`
<!-- Base Examples -->
<Card>
<img src={img1} className="card-img-top" alt="card img" />
    <Card.Body>
        <h5 className="card-title">Card title</h5>
        <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
        <Link href="#" className="btn btn-primary">Go somewhere</Link>
    </Card.Body>
</Card>

<Card>
    <img src={img2} className="card-img-top" alt="card dummy img" />
    <Card.Body>
        <h5 className="card-title placeholder-glow">
            <span className="placeholder col-6"></span>
        </h5>
        <p className="card-text placeholder-glow">
            <span className="placeholder col-7"></span>
            <span className="placeholder col-4"></span>
            <span className="placeholder col-4"></span>
            <span className="placeholder col-6"></span>
        </p>
        <Link href="#" tabIndex="-1" className="btn btn-primary disabled placeholder col-6"></Link>
    </Card.Body>
</Card>

`,r=()=>a.jsx(l,{code:e,language:"html",plugins:["line-numbers"]}),s=`
<!-- Width Sizing-->
<div className="live-preview">
    <span className="placeholder col-6"></span>
    <span className="placeholder w-75"></span>
    <span className="placeholder" style={{width: "25%"}}></span>
</div>
`,d=()=>a.jsx(l,{code:s,language:"html",plugins:["line-numbers"]}),c=`
<!-- Sizing -->
<span className="placeholder col-12 placeholder-lg"></span>

<span className="placeholder col-12"></span>

<span className="placeholder col-12 placeholder-sm"></span>

<span className="placeholder col-12 placeholder-xs"></span>
`,m=()=>a.jsx(l,{code:c,language:"html",plugins:["line-numbers"]}),o=`
<!-- Color -->
<span className="placeholder col-12 mb-3"></span>

<span className="placeholder col-12 mb-3 bg-primary"></span>

<span className="placeholder col-12 mb-3 bg-secondary"></span>

<span className="placeholder col-12 mb-3 bg-success"></span>

<span className="placeholder col-12 mb-3 bg-danger"></span>

<span className="placeholder col-12 mb-3 bg-warning"></span>

<span className="placeholder col-12 mb-3 bg-info"></span>

<span className="placeholder col-12 mb-3 bg-light"></span>

<span className="placeholder col-12 mb-3 bg-dark"></span>
`,t=()=>a.jsx(l,{code:o,language:"html",plugins:["line-numbers"]});export{t as ColorExample,r as DefaultPlaceholderExample,m as SizingExample,d as WidthExample};
