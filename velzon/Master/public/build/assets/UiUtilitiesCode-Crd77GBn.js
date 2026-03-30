import{j as e}from"./app-DJ9lNZKt.js";import{P as a}from"./Prism-5k6_z9Xj.js";const t=`
<!-- Stacks - Vertical -->
<div className="vstack gap-3">
    <div className="bg-light border p-1 px-2">First item</div>
    <div className="bg-light border p-1 px-2">Second item</div>
    <div className="bg-light border p-1 px-2">Third item</div>
</div>

<div className="vstack gap-2">
    <Button variant="primary">Save changes</Button>
    <Button variant="secondary" outline>Cancel</Button>
</div>
`,p=()=>e.jsx(a,{code:t,language:"html",plugins:["line-numbers"]}),s=`
<!-- Stacks - Horizontal -->
<div className="hstack gap-3">
    <div className="bg-light border p-1 px-2">First item</div>
    <div className="bg-light border p-1 px-2">Second item</div>
    <div className="bg-light border p-1 px-2">Third item</div>
</div>

<div className="hstack gap-3">
    <div className="bg-light border p-1 px-2">First item</div>
    <div className="bg-light border p-1 px-2 ms-auto">Second item</div>
    <div className="bg-light border p-1 px-2">Third item</div>
</div>

<div className="hstack gap-3">
    <div className="bg-light border p-1 px-2">First item</div>
    <div className="vr"></div>
    <div className="bg-light border p-1 px-2">Second item</div>
    
    <div className="bg-light border p-1 px-2 ms-auto">Third item</div>
</div>

<div className="hstack gap-3"> 
    <Input className="form-control me-auto" type="text" placeholder="Add your item here..." />
    <Button variant="primary">Submit</Button>
    <div className="vr"></div>
    <Button variant="secondary" outline>Reset</Button>
</div>
`,g=()=>e.jsx(a,{code:s,language:"html",plugins:["line-numbers"]}),i=`
<!-- Text Selection -->
<p className="user-select-all">This paragraph will be entirely selected when clicked by the user.</p>

<p className="user-select-auto">This paragraph has default select behavior.</p>

<p className="user-select-none mb-0">This paragraph will not be selectable when clicked by the user.</p>
`,u=()=>e.jsx(a,{code:i,language:"html",plugins:["line-numbers"]}),d=`
<!-- Pointer events -->
<p><Link to="#" className="text-success pe-none" tabIndex="-1" aria-disabled="true">This link</Link> can not be clicked.</p>

<p><Link to="#" className="text-success pe-auto">This link</Link> can be clicked (this is default behavior).</p>
    
<p className="pe-none mb-0"><Link to="#" className="text-success" tabindex="-1" aria-disabled="true">This link</Link> can not be clicked because the <code>pointer-events</code> property is inherited from its parent. However, <Link to="#" className="pe-auto">this link</Link> has a <code>pe-auto</code> class and can be clicked.</p>
`,b=()=>e.jsx(a,{code:d,language:"html",plugins:["line-numbers"]}),o=`
<!-- Overflow -->
    <div className="overflow-hidden p-3 mb-0 bg-light" style={{height: "100px"}}>
        This is an example of using <code>.overflow-hidden</code> on an element with set width and height dimensions. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </div>
    
    <div className="overflow-visible p-3 mb-0 bg-light" style={{height: "100px"}}>
        This is an example of using <code>.overflow-visible</code> on an element with set width and height dimensions.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </div>
    
    <div className="overflow-scroll p-3 mb-0 bg-light" style={{height: "100px"}}>
        This is an example of using <code>.overflow-scroll</code> on an element with set width and height dimensions. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </div>
`,h=()=>e.jsx(a,{code:o,language:"html",plugins:["line-numbers"]}),l=`
<!-- Arrange elements -->
<div className="position-relative p-5 bg-light m-3 border rounded" style={{height: "180px"}}>
    <div className="position-absolute top-0 start-0 avatar-xs bg-dark rounded"></div>
    <div className="position-absolute top-0 end-0 avatar-xs bg-dark rounded"></div>
    <div className="position-absolute top-50 start-50 avatar-xs bg-dark rounded"></div>
    <div className="position-absolute bottom-50 end-50 avatar-xs bg-dark rounded"></div>
    <div className="position-absolute bottom-0 start-0 avatar-xs bg-dark rounded"></div>
    <div className="position-absolute bottom-0 end-0 avatar-xs bg-dark rounded"></div>
</div>

<!-- Center elements -->
<div className="position-relative m-3 bg-light border rounded" style={{height: "180px"}}>
    <div className="position-absolute top-0 start-0 translate-middle avatar-xs bg-dark rounded"></div>
    <div className="position-absolute top-0 start-50 translate-middle avatar-xs bg-dark rounded"></div>
    <div className="position-absolute top-0 start-100 translate-middle avatar-xs bg-dark rounded"></div>

    <div className="position-absolute top-50 start-0 translate-middle avatar-xs bg-dark rounded"></div>
    <div className="position-absolute top-50 start-50 translate-middle avatar-xs bg-dark rounded"></div>
    <div className="position-absolute top-50 start-100 translate-middle avatar-xs bg-dark rounded"></div>

    <div className="position-absolute top-100 start-0 translate-middle avatar-xs bg-dark rounded"></div>
    <div className="position-absolute top-100 start-50 translate-middle avatar-xs bg-dark rounded"></div>
    <div className="position-absolute top-100 start-100 translate-middle avatar-xs bg-dark rounded"></div>
</div>

<!-- Center elements -->
    <div className="position-relative m-3 bg-light border rounded" style={{height: "180px"}}>
    <div className="position-absolute top-0 start-0 avatar-xs bg-dark rounded "></div>
    <div className="position-absolute top-0 start-50 translate-middle-x avatar-xs bg-dark rounded"></div>
    <div className="position-absolute top-0 end-0 avatar-xs bg-dark rounded"></div>

    <div className="position-absolute top-50 start-0 translate-middle-y avatar-xs bg-dark rounded"></div>
    <div className="position-absolute top-50 start-50 translate-middle avatar-xs bg-dark rounded"></div>
    <div className="position-absolute top-50 end-0 translate-middle-y avatar-xs bg-dark rounded"></div>

    <div className="position-absolute bottom-0 start-0 avatar-xs bg-dark rounded"></div>
    <div className="position-absolute bottom-0 start-50 translate-middle-x avatar-xs bg-dark rounded"></div>
    <div className="position-absolute bottom-0 end-0 avatar-xs bg-dark rounded"></div>
</div>
`,x=()=>e.jsx(a,{code:l,language:"html",plugins:["line-numbers"]}),n=`
<!-- Shadows -->
<div className="shadow-none p-3 bg-light rounded">No shadow</div>

<div className="shadow-sm p-3 bg-light rounded">Small shadow</div>

<div className="shadow p-3 bg-light rounded">Regular shadow</div>

<div className="shadow-lg p-3 bg-light rounded">Larger shadow</div>
`,N=()=>e.jsx(a,{code:n,language:"html",plugins:["line-numbers"]}),r=`
<!-- Width -->
<div className="w-25 p-3 bg-light">Width 25%</div>

<div className="w-50 p-3 bg-light">Width 50%</div>

<div className="w-75 p-3 bg-light">Width 75%</div>

<div className="w-100 p-3 bg-light">Width 100%</div>

<div className="w-auto p-3 bg-light">Width auto</div>
`,k=()=>e.jsx(a,{code:r,language:"html",plugins:["line-numbers"]}),m=`
<!-- Height -->
<div className="h-25 p-3 bg-light">Height25%</div>

<div className="h-50 p-3 bg-light">Height50%</div>

<div className="h-75 p-3 bg-light">Height75%</div>

<div className="h-100 p-3 bg-light">Height100%</div>

<div className="h-auto p-3 bg-light">Height auto</div>
`,w=()=>e.jsx(a,{code:m,language:"html",plugins:["line-numbers"]});export{w as HeightExample,h as OverflowExample,b as PointerEventsExample,x as PositionExample,N as ShadowsExample,g as StacksHorizontalExample,p as StacksVerticalExample,u as TextSelectionExample,k as WidthExample};
