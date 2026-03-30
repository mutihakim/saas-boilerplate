import{j as s}from"./app-DJ9lNZKt.js";import{P as a}from"./Prism-5k6_z9Xj.js";const e=`
<!-- Base Examples -->
<div className="mb-4">
    <ProgressBar now={0} />
</div>

<div className="mb-4">
    <ProgressBar now={25} />
</div>

<div className="mb-4">
    <ProgressBar now={50} />
</div>

<div className="mb-4">
    <ProgressBar now={75} />
</div>

<div>
    <ProgressBar now={100} />
</div>`,P=()=>s.jsx(a,{code:e,language:"html",plugins:["line-numbers"]}),r=`
<!-- Backgrounds -->
<div className="mb-4">
    <ProgressBar variant="primary" now={15} />
</div>

<div className="mb-4">
    <ProgressBar variant="success" now={25} />
</div>

<div className="mb-4">
    <ProgressBar variant="info" now={50} />
</div>

<div className="mb-4">
    <ProgressBar variant="warning" now={75} />
</div>

<div>
    <ProgressBar variant="danger" now={100} />
</div>`,h=()=>s.jsx(a,{code:r,language:"html",plugins:["line-numbers"]}),i=`
<!-- Labels Example -->
<ProgressBar variant="primary" now={25}> 25% </Progress>
`,w=()=>s.jsx(a,{code:i,language:"html",plugins:["line-numbers"]}),o=`
<!-- Multiple Bars -->
<ProgressBar multi>
    <ProgressBar bar now="15" />
    <ProgressBar bar variant="success" now="30" />
    <ProgressBar bar variant="info" now="20" />
</Progress>
`,B=()=>s.jsx(a,{code:o,language:"html",plugins:["line-numbers"]}),d=`
<!-- Prgress sm -->
<div className="mb-4">
    <h5 className="fs-13">Small Progress</h5>
    <ProgressBar variant="primary" now={25} className="progress-sm" />
</div>

<!-- Prgress Default -->
<div className="mb-4">
    <h5 className="fs-13">Default Progress </h5>
    <ProgressBar variant="success" now={40} className="progress-md" />
</div>

<!-- Prgress lg -->
<div className="mb-4">
    <h5 className="fs-13">Large Progress</h5>
    <ProgressBar variant="warning" now={50} className="progress-lg" />
</div>

<!-- Prgress xl -->
<div>
    <h5 className="fs-13">Extra Large Progress</h5>
    <ProgressBar variant="danger" now={70} className="progress-xl" />
</div>
`,x=()=>s.jsx(a,{code:d,language:"html",plugins:["line-numbers"]}),n=`
<!-- Striped Prgress -->
<div className="mb-4">
    <ProgressBar striped now={25} />
</div>
<div>
    <ProgressBar variant="success" striped now={40} />
</div>
`,f=()=>s.jsx(a,{code:n,language:"html",plugins:["line-numbers"]}),l=`
<!-- Animated Striped Progress -->
<div>
    <ProgressBar now={75} striped animated />
</div>
`,C=()=>s.jsx(a,{code:l,language:"html",plugins:["line-numbers"]}),t=`
<!-- Gradient -->
<div className="mb-4">
    <ProgressBar now={15} className="bg-gradient" />
</div>
<div className="mb-4">
    <ProgressBar variant="success" now={25} className="bg-gradient" />
</div>
<div className="mb-4">
    <ProgressBar variant="info" now={50} className="bg-gradient" />
</div>
<div className="mb-4">
    <ProgressBar variant="warning" now={75} className="bg-gradient" />
</div>
<div>
    <ProgressBar variant="danger" now={100} className="bg-gradient" />
</div>
`,y=()=>s.jsx(a,{code:t,language:"html",plugins:["line-numbers"]}),m=`
<!-- Animated Progress -->
<div className="mb-4">
    <ProgressBar now={15} className="animated-progess" />
</div>
<div className="mb-4">
    <ProgressBar now={25} variant="success" className="animated-progess" />
</div>
<div className="mb-4">
    <ProgressBar now={50} variant="info" className="animated-progess" />
</div>
<div className="mb-4">
    <ProgressBar now={75} variant="warning" className="animated-progess" />
</div>
<div>
    <ProgressBar now={100} variant="danger" className="animated-progess" />
</div>
`,E=()=>s.jsx(a,{code:m,language:"html",plugins:["line-numbers"]}),g=`
<!-- Custom Progress -->
<div className="mb-4">
    <ProgressBar now={15} variant="primary" className="animated-progess custom-progress" />
</div>
<div className="mb-4">
    <ProgressBar now={25} variant="success" className="animated-progess custom-progress" />
</div>
<div className="mb-4">
    <ProgressBar now={50} variant="info" className="animated-progess custom-progress" />
</div>
<div className="mb-4">
    <ProgressBar now={75} variant="warning" className="animated-progess custom-progress" />
</div>
<div>
    <ProgressBar now={100} variant="danger" className="animated-progess custom-progress" />
</div>
`,j=()=>s.jsx(a,{code:g,language:"html",plugins:["line-numbers"]}),c=`
<!-- Custom Progress with Label -->
<div className="d-flex align-items-center pb-2 mt-4">
    <div className="flex-shrink-0 me-3">
        <div className="avatar-xs">
            <div className="avatar-title bg-light rounded-circle text-muted fs-16">
                <i className="mdi mdi-facebook"></i>
            </div>
        </div>
    </div>
    <div className="flex-grow-1">
        <div>
            <ProgressBar now={15} variant="primary" className="animated-progess custom-progress progress-label" ><div className="label">15%</div> </Progress>
        </div>
    </div>
</div>

<div className="d-flex align-items-center py-2">
    <div className="flex-shrink-0 me-3">
        <div className="avatar-xs">
            <div className="avatar-title bg-light rounded-circle text-muted fs-16">
                <i className="mdi mdi-twitter"></i>
            </div>
        </div>
    </div>
    <div className="flex-grow-1">
        <div>
            <ProgressBar now={25} variant="success" className="animated-progess custom-progress progress-label" ><div className="label">25%</div> </Progress>
        </div>
    </div>
</div>

<div className="d-flex align-items-center py-2">
    <div className="flex-shrink-0 me-3">
        <div className="avatar-xs">
            <div className="avatar-title bg-light rounded-circle text-muted fs-16">
                <i className="mdi mdi-github"></i>
            </div>
        </div>
    </div>
    <div className="flex-grow-1">
        <div>
            <ProgressBar now={50} variant="info" className="animated-progess custom-progress progress-label" ><div className="label">30%</div> </Progress>
        </div>
    </div>
</div>
`,S=()=>s.jsx(a,{code:c,language:"html",plugins:["line-numbers"]}),v=`
<!-- Content Progress -->
<Card className="bg-light overflow-hidden shadow-none">
    <Card.Body>
        <div className="d-flex">
            <div className="flex-grow-1">
                <h6 className="mb-0"><b className="text-secondary">30%</b> Update in
                    progress...</h6>
            </div>
            <div className="flex-shrink-0">
                <h6 className="mb-0">1 min left</h6>
            </div>
        </div>
    </Card.Body>
    <div >
        <ProgressBar now={30} variant="info" className="bg-info-subtle rounded-0" />
    </div>
</Card>

<Card className="bg-light overflow-hidden shadow-none">
    <Card.Body>
        <div className="d-flex">
            <div className="flex-grow-1">
                <h6 className="mb-0"><b className="text-success">60%</b> Update in
                    progress...</h6>
            </div>
            <div className="flex-shrink-0">
                <h6 className="mb-0">45s left</h6>
            </div>
        </div>
    </Card.Body>
    <div>
        <ProgressBar now={60} variant="success" className="bg-success-subtle rounded-0" />
    </div>
</Card>

<Card className="bg-light overflow-hidden shadow-none">
    <Card.Body>
        <div className="d-flex">
            <div className="flex-grow-1">
                <h6 className="mb-0"><b className="text-danger">82%</b> Update in
                    progress...</h6>
            </div>
            <div className="flex-shrink-0">
                <h6 className="mb-0">25s left</h6>
            </div>
        </div>
    </Card.Body>
    <div>
        <ProgressBar now={82} variant="danger" className="bg-danger-subtle rounded-0" />
    </div>
</Card>
`,k=()=>s.jsx(a,{code:v,language:"html",plugins:["line-numbers"]}),p=`
<!-- Progress with Steps -->
<div className="position-relative m-4">
    <ProgressBar now={50} style={{ height: "1px" }} />
    <Button size="sm" variant="primary" className="position-absolute top-0 start-0 translate-middle rounded-pill" style={{ width: "2rem", height: "2rem" }}>1</Button>
    <Button size="sm" variant="primary" className="position-absolute top-0 start-50 translate-middle rounded-pill" style={{ width: "2rem", height: "2rem" }}>2</Button>
    <Button size="sm" variant="light" className="position-absolute top-0 start-100 translate-middle rounded-pill" style={{ width: "2rem", height: "2rem" }}>3</Button>
</div>
`,A=()=>s.jsx(a,{code:p,language:"html",plugins:["line-numbers"]}),u=`
<!-- Step Progress with Arrow -->
<ProgressBar multi className='progress-step-arrow progress-info'>
    <ProgressBar bar now="35"> Step 1 </Progress>
    <ProgressBar bar now="35"> Step 2 </Progress>
    <ProgressBar bar now="35" variant="light" className="text-body"> Step 3 </Progress>
</Progress>
`,L=()=>s.jsx(a,{code:u,language:"html",plugins:["line-numbers"]});export{E as AnimatedExample,C as AnimatedStripedExample,h as BackgroundColorExample,k as ContentExample,j as CustomExample,S as CustomProgressExample,P as DefaultProgressExample,y as GradientExample,x as HeightExample,w as LabelExample,B as MultipleBarsExample,A as ProgressWithStepExample,L as StepProgressArrowExample,f as StripedExample};
