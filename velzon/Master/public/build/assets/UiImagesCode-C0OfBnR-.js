import{j as a}from"./app-DJ9lNZKt.js";import{P as e}from"./Prism-5k6_z9Xj.js";const r=`
<!-- Rounded Image -->
<img className="rounded material-shadow" alt="200x200" width="200" src={img4} />

<!-- Rounded-circle Image -->
<img className="rounded-circle avatar-xl material-shadow" alt="200x200" src={avatar4} />
`,v=()=>a.jsx(e,{code:r,language:"html",plugins:["line-numbers"]}),t=`
<!-- Thumbnails Images -->
<img className="img-thumbnail" alt="200x200" width="200" src={img3} />

<img className="img-thumbnail rounded-circle avatar-xl" alt="200x200" src={avatar3} />
`,g=()=>a.jsx(e,{code:t,language:"html",plugins:["line-numbers"]}),i=`
<!-- Image Sizes -->
<img src={avatar2} alt="" className="rounded material-shadow avatar-xxs" />

<img src={avatar10} alt="" className="rounded material-shadow avatar-xs" />

<img src={avatar3} alt="" className="rounded material-shadow avatar-sm" />

<img src={avatar4} alt="" className="rounded material-shadow avatar-md" />

<img src={avatar5} alt="" className="rounded material-shadow avatar-lg" />

<img src={avatar8} alt="" className="rounded material-shadow avatar-xl" />

<img src={avatar2} alt="" className="rounded-circle material-shadow avatar-xxs" />

<img src={avatar10} alt="" className="rounded-circle material-shadow avatar-xs" />

<img src={avatar3} alt="" className="rounded-circle material-shadow avatar-sm" />

<img src={avatar4} alt="" className="rounded-circle material-shadow avatar-md" />

<img src={avatar5} alt="" className="rounded-circle material-shadow avatar-lg" />

<img src={avatar8} alt="" className="rounded-circle material-shadow avatar-xl" />
`,n=()=>a.jsx(e,{code:i,language:"html",plugins:["line-numbers"]}),s=`
<!-- Avatar With Content -->
<div className="avatar-xxs">
    <div className="avatar-title rounded material-shadow bg-primary-subtle text-primary">
    XXS
    </div>
</div>

<div className="avatar-xs">
    <div className="avatar-title rounded material-shadow bg-secondary-subtle text-secondary">
    XS
    </div>
</div>

<div className="avatar-sm">
    <div className="avatar-title rounded material-shadow bg-success-subtle text-success">
    Sm
    </div>
</div>

<div className="avatar-md">
    <div className="avatar-title rounded material-shadow bg-info-subtle text-info">
    Md
    </div>
</div>

<div className="avatar-lg">
    <div className="avatar-title rounded material-shadow bg-warning-subtle text-warning">
    Lg
    </div>
</div>

<div className="avatar-xl">
    <div className="avatar-title rounded material-shadow bg-danger-subtle text-danger">
    Xl
    </div>
</div>
`,u=()=>a.jsx(e,{code:s,language:"html",plugins:["line-numbers"]}),l=`
<!-- Simple Group -->
<div className="avatar-group">
    <div className="avatar-group-item material-shadow">
        <img src={avatar4} alt="" className="rounded-circle avatar-sm" />
    </div>
    <div className="avatar-group-item material-shadow">
    <img src={avatar5} alt="" className="rounded-circle avatar-sm" />
    </div>
    <div className="avatar-group-item material-shadow">
        <div className="avatar-sm">
            <div className="avatar-title rounded-circle bg-light text-primary">
                A
            </div>
        </div>
    </div>
    <div className="avatar-group-item material-shadow">
        <img src={avatar2} alt="" className="rounded-circle avatar-sm" />
    </div>
</div>

<!-- Avatar Group with Tooltip -->
<div className="mt-lg-0 mt-3">
    <p className="text-muted">Use <code>avatar-group</code> class with <code>data-bs-toggle="tooltip"</code> to show avatar group images with tooltip.</p>
    <div className="avatar-group">
<Link href="#" className="avatar-group-item material-shadow" >
    <OverlayTrigger
        placement="top"
        overlay={<Tooltip id="button-tooltip"> Christi </Tooltip>}
    >
        <Image src={avatar4} alt="" className="rounded-circle avatar-sm" />
    </OverlayTrigger>
</Link>
<Link href="#" className="avatar-group-item material-shadow">
<OverlayTrigger
    placement="top"
    overlay={<Tooltip id="button-tooltip"> Frank Hook </Tooltip>}
>
    <Image src={avatar3} alt="" className="rounded-circle avatar-sm" />
</OverlayTrigger>
</Link>
<Link href="#" className="avatar-group-item material-shadow">
<OverlayTrigger
    placement="top"
    overlay={<Tooltip id="button-tooltip"> Christi </Tooltip>}
>
    <div className="avatar-sm">
        <div className="avatar-title rounded-circle bg-light text-primary">
            C
        </div>
    </div>
</OverlayTrigger>
</Link>

<Link href="#" className="avatar-group-item material-shadow">
<OverlayTrigger
    placement="top"
    overlay={<Tooltip id="button-tooltip"> MORE </Tooltip>}
>
    <div className="avatar-sm">
        <div className="avatar-title rounded-circle">
            2+
        </div>
    </div>
</OverlayTrigger>
</Link>
</div>
    </div>
`,p=()=>a.jsx(e,{code:l,language:"html",plugins:["line-numbers"]}),m=`
<!-- figures Images -->
<figure className="figure">
    <img src={img4} className="figure-img img-fluid rounded" alt="..." />
    <figcaption className="figure-caption">A caption for the above image.</figcaption>
</figure>

<figure className="figure mb-0">
    <img src={img5} className="figure-img img-fluid rounded" alt="..." />
    <figcaption className="figure-caption text-end">A caption for the above image.</figcaption>
</figure>
`,N=()=>a.jsx(e,{code:m,language:"html",plugins:["line-numbers"]}),d=`
<!-- Responsive Images -->
<img src={img2} className="img-fluid" alt="Responsive image" />
`,h=()=>a.jsx(e,{code:d,language:"html",plugins:["line-numbers"]});export{u as AvatarExample,p as AvatarGroupExample,N as FiguresExample,v as ImgRoundedCircleExample,n as ImgSizesExample,g as ImgThumbnailsExample,h as ResponsiveExample};
