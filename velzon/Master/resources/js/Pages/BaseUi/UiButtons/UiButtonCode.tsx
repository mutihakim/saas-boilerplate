import PrismCode from "../../../Components/Common/Prism";

// Default Buttons

const defaultButtonsCode =
    `
<!-- Base Buttons -->
<Button variant="primary"> Primary </Button>

<Button variant="secondary"> Secondary </Button>

<Button variant="success"> Success </Button>

<Button variant="info"> Info </Button>

<Button variant="warning"> Warning </Button>

<Button variant="danger"> Danger </Button>

<Button variant="dark"> Dark </Button>

<Button variant="link"> Link </Button>

<Button variant="light"> Light </Button>
`;

const DefaultButtonsExample = () => (
    <PrismCode
        code={defaultButtonsCode}
        language={("html")}
        plugins={["line-numbers"]}
    />
);

// Outline Buttons

const outlineButtonsCode =
    `
<!-- Outline Buttons -->
<Button className='material-shadow-none' variant="outline-primary"> primary </Button>

<Button className='material-shadow-none' variant="outline-secondary"> Secondary </Button>

<Button className='material-shadow-none' variant="outline-success"> Success </Button>

<Button className='material-shadow-none' variant="outline-info"> Info </Button>

<Button className='material-shadow-none' variant="outline-warning"> Warning </Button>

<Button className='material-shadow-none' variant="outline-danger"> Danger </Button>

<Button className='material-shadow-none' variant="outline-dark"> Dark </Button>

<Button className='material-shadow-none' variant="outline-light"> Light </Button>
`;

const OutlineButtonsExample = () => (
    <PrismCode
        code={outlineButtonsCode}
        language={("html")}
        plugins={["line-numbers"]}
    />
);

// Rounded Buttons

const roundedButtonsCode =
    `
<!-- Rounded Buttons -->
<Button variant="primary" className="rounded-pill"> Primary </Button>

<Button variant="secondary" className="rounded-pill"> Secondary </Button>

<Button variant="success" className="rounded-pill"> Success </Button>

<Button variant="info" className="rounded-pill"> Info </Button>

<Button variant="warning" className="rounded-pill"> Warning </Button>

<Button variant="danger" className="rounded-pill"> Danger </Button>

<Button variant="dark" className="rounded-pill"> Dark </Button>

<Button variant="light" className="rounded-pill"> Light </Button>
`;

const RoundedButtonsExample = () => (
    <PrismCode
        code={roundedButtonsCode}
        language={("html")}
        plugins={["line-numbers"]}
    />
);

// Soft Buttons

const softButtonsCode =
    `
<!-- Soft Buttons -->
<Button className="btn-soft-primary material-shadow-none"> Primary </Button>

<Button className="btn-soft-secondary material-shadow-none"> Secondary </Button>

<Button className="btn-soft-success material-shadow-none"> Success </Button>

<Button className="btn-soft-info material-shadow-none"> Info </Button>

<Button className="btn-soft-warning material-shadow-none"> Warning </Button>

<Button className="btn-soft-danger material-shadow-none"> Danger </Button>

<Button className="btn-soft-dark material-shadow-none"> Dark </Button>
`;

const SoftButtonsExample = () => (
    <PrismCode
        code={softButtonsCode}
        language={("html")}
        plugins={["line-numbers"]}
    />
);



// Gradient Buttons

const gradientButtonsCode =
    `
<!-- Gradient Buttons -->
<Button variant="primary" className="bg-gradient"> Primary </Button>

<Button variant="secondary" className="bg-gradient"> Secondary </Button>

<Button variant="success" className="bg-gradient"> Success </Button>

<Button variant="info" className="bg-gradient"> Info </Button>

<Button variant="warning" className="bg-gradient"> Warning </Button>

<Button variant="danger" className="bg-gradient"> Danger </Button>

<Button variant="dark" className="bg-gradient"> Dark </Button>

<Button variant="light" className="bg-gradient"> Light </Button>
`;

const GradientButtonsExample = () => (
    <PrismCode
        code={gradientButtonsCode}
        language={("html")}
        plugins={["line-numbers"]}
    />
);

// Animation Buttons

const animationButtonsCode =
    `
<!-- Animation Buttons -->
<Button variant="primary" className="btn-animation" data-text="Primary"> <span>Primary</span> </Button>

<Button variant="secondary" className="btn-animation" data-text="Secondary"> <span>Secondary</span> </Button>

<Button variant="success" className="btn-animation" data-text="Success"> <span>Success</span> </Button>

<Button variant="info" className="btn-animation" data-text="Info"> <span>Info</span> </Button>

<Button variant="warning" className="btn-animation" data-text="Warning"> <span>Warning</span> </Button>

<Button variant="danger" className="btn-animation" data-text="Danger"> <span>Danger</span> </Button>

<Button variant="dark" className="btn-animation" data-text="Dark"> <span>Dark</span> </Button>
`;

const AnimationButtonsExample = () => (
    <PrismCode
        code={animationButtonsCode}
        language={("html")}
        plugins={["line-numbers"]}
    />
);

// Buttons with Label

const labelButtonsCode =
    `
<!-- Buttons with Label -->
<Button variant="primary" className="btn-label"> <i className="ri-user-smile-line label-icon align-middle fs-16 me-2"></i> Primary </Button>

<Button variant="success" className="btn-label"> <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i> Success </Button>

<Button variant="warning" className="btn-label"> <i className="ri-error-warning-line label-icon align-middle fs-16 me-2"></i> Warning </Button>

<!-- Rounded with Label -->
<Button variant="primary" className="btn-label rounded-pill"> <i className="ri-user-smile-line label-icon align-middle fs-16 me-2"></i> Primary </Button>

<Button variant="success" className="btn-label rounded-pill"> <i className="ri-check-double-line label-icon align-middle fs-16 me-2"></i> Success </Button>

<Button variant="warning" className="btn-label rounded-pill"> <i className="ri-error-warning-line label-icon align-middle fs-16 me-2"></i> Warning </Button>

<!-- Buttons with Label Right -->
<Button variant="primary" className="btn-label right"> <i className="ri-user-smile-line label-icon align-middle fs-16 ms-2"></i> Primary </Button>

<Button variant="success" className="btn-label right rounded-pill"> <i className="ri-check-double-line label-icon align-middle rounded-pill fs-16 ms-2"></i> Success </Button>
`;

const LabelButtonsExample = () => (
    <PrismCode
        code={labelButtonsCode}
        language={("html")}
        plugins={["line-numbers"]}
    />
);


// Buttons Sizes

const sizeButtonsCode =
    `
<!-- Large Button -->
<Button size="lg" variant="primary"> Large button </Button>

<Button size="lg" variant="light"> Large button </Button>

<!-- Small Button -->
<Button size="sm" variant="primary"> Small button </Button>

<Button size="sm" variant="light"> Small button </Button>
`;

const SizeButtonsExample = () => (
    <PrismCode
        code={sizeButtonsCode}
        language={("html")}
        plugins={["line-numbers"]}
    />
);

// Buttons Width

const widthButtonsCode =
    `
<!-- Width Button -->
<Button variant="primary" className="w-xs"> Xs </Button>

<Button variant="danger" className="w-sm"> Small </Button>

<Button variant="warning" className="w-md"> Medium </Button>

<Button variant="success" className="w-lg"> Large </Button>
`;

const WidthButtonsExample = () => (
    <PrismCode
        code={widthButtonsCode}
        language={("html")}
        plugins={["line-numbers"]}
    />
);

// Buttons Tag

const tagButtonsCode =
    `
<!-- Tag Button -->
<Link to="#" className="btn btn-primary"> Link </Link>

<Button variant="success" type="submit"> Button </Button>

<Button variant="info" type="button"> Input </Button>

<Button variant="success" type="submit"> Submit </Button>

<Button variant="warning" type="reset"> Reset </Button>
`;

const TagButtonsExample = () => (
    <PrismCode
        code={tagButtonsCode}
        language={("html")}
        plugins={["line-numbers"]}
    />
);


// Buttons Grid

const gridButtonsCode =
    `
<!-- Buttons Grid -->
<div className="d-grid gap-2">
    <Button variant="primary"> Button </Button>
    <Button variant="primary"> Button </Button>
</div>
`;

const GridButtonsExample = () => (
    <PrismCode
        code={gridButtonsCode}
        language={("html")}
        plugins={["line-numbers"]}
    />
);


// Buttons Checkbox & Radio

const checkButtonsCode =
    `<div className="d-flex flex-wrap align-items-center gap-2">
<ButtonGroup>
    <Input type="checkbox" className="btn-check" id="btncheck1" defaultChecked="" />
    <Button variant="primary" className="mb-0 material-shadow-none" id="btncheck1"> Checkbox 1 </Button>

    <Input type="checkbox" className="btn-check" id="btncheck2" />
    <Button variant="primary" className="mb-0 material-shadow-none" id="btncheck2"> Checkbox 2 </Button>

    <Input type="checkbox" className="btn-check" id="btncheck3" />
    <Button variant="primary" className="mb-0 material-shadow-none" id="btncheck3"> Checkbox 3 </Button>
</ButtonGroup>

<ButtonGroup>
    <Input type="radio" className="btn-check" name="btnradio" id="btnradio1" defaultChecked="" />
    <Button variant="secondary" className="mb-0 material-shadow-none" id="btnradio1" outline> Radio 1 </Button>

    <Input type="radio" className="btn-check" name="btnradio" id="btnradio2" />
    <Button variant="secondary" className="mb-0 material-shadow-none" id="btnradio2" outline> Radio 2 </Button>

    <Input type="radio" className="btn-check" name="btnradio" id="btnradio3" />
    <Button variant="secondary" className="mb-0 material-shadow-none" id="btnradio3" outline> Radio 3 </Button>

</ButtonGroup>
</div>
`;

const CheckButtonsExample = () => (
    <PrismCode
        code={checkButtonsCode}
        language={("html")}
        plugins={["line-numbers"]}
    />
);


// Buttons Group

const groupButtonsCode =
    `
<!-- Buttons Group -->
<ButtonGroup>
    <Button variant="primary" className='material-shadow-none'> Left </Button>
    <Button variant="primary" className='material-shadow-none'> Middle </Button>
    <Button variant="primary" className='material-shadow-none'> Right </Button>
</ButtonGroup>

<!-- Radio Buttons -->
<ButtonGroup className="mt-4 mt-sm-0">
    <Button variant="light" className="btn-icon material-shadow-none"> <i className="ri-align-right" /> </Button>
    <Button variant="light" className="btn-icon material-shadow-none"> <i className="ri-align-center" /> </Button>
    <Button variant="light" className="btn-icon material-shadow-none"> <i className="ri-align-left" /> </Button>
</ButtonGroup>
`;

const GroupButtonsExample = () => (
    <PrismCode
        code={groupButtonsCode}
        language={("html")}
        plugins={["line-numbers"]}
    />
);


// Buttons Icon

const iconButtonsCode =
    `
<!-- Buttons Group -->
<Button variant="primary" className="btn-icon"> <i className="ri-map-pin-line" /> </Button>
<Button variant="danger" className="btn-icon"> <i className="ri-delete-bin-5-line" /> </Button>
<Button variant="success" className="btn-icon"> <i className="ri-check-double-line" /> </Button>
<Button variant="light" className="btn-icon"> <i className="ri-brush-2-fill" /> </Button>

<Button variant="primary" className="btn-icon material-shadow-none" outline> <i className="ri-24-hours-fill" /> </Button>
<Button variant="danger" className="btn-icon material-shadow-none" outline> <i className="ri-customer-service-2-line" /> </Button>
<Button variant="success" className="btn-icon material-shadow-none" outline> <i className="ri-mail-send-line" /> </Button>
<Button variant="warning" className="btn-icon material-shadow-none" outline> <i className="ri-menu-2-line" /> </Button>
`;

const IconButtonsExample = () => (
    <PrismCode
        code={iconButtonsCode}
        language={("html")}
        plugins={["line-numbers"]}
    />
);

// Buttons Toolbar

const toolbarButtonsCode =
    `
<!-- Buttons Toolbar -->
<ButtonToolbar>
    <ButtonGroup className="me-2">
        <Button variant="light" className='material-shadow-none'>1</Button>
        <Button variant="light" className='material-shadow-none'>2</Button>
        <Button variant="light" className='material-shadow-none'>3</Button>
        <Button variant="light" className='material-shadow-none'>4</Button>
    </ButtonGroup>
    <ButtonGroup className="me-2">
        <Button variant="light" className='material-shadow-none'>5</Button>
        <Button variant="light" className='material-shadow-none'>6</Button>
        <Button variant="light" className='material-shadow-none'>7</Button>
    </ButtonGroup>
    <ButtonGroup>
        <Button variant="light" className='material-shadow-none'>8</Button>
    </ButtonGroup>
</ButtonToolbar>
`;

const ToolbarButtonsExample = () => (
    <PrismCode
        code={toolbarButtonsCode}
        language={("html")}
        plugins={["line-numbers"]}
    />
);

// Group Buttons Sizing

const groupSizingButtonsCode =
    `
<!-- Group Buttons Sizing -->
<ButtonGroup size="lg">
    <Button variant="primary" className='material-shadow-none'>Left</Button>
    <Button variant="primary" className='material-shadow-none'>Middle</Button>
    <Button variant="primary" className='material-shadow-none'>Right</Button>
</ButtonGroup>

<ButtonGroup className="mt-2">
    <Button variant="light" className='material-shadow-none'>Left</Button>
    <Button variant="light" className='material-shadow-none'>Middle</Button>
    <Button variant="light" className='material-shadow-none'>Right</Button>
</ButtonGroup>

<ButtonGroup size="sm" className="mt-2">
    <Button variant="secondary" className='material-shadow-none'>Left</Button>
    <Button variant="secondary" className='material-shadow-none'>Middle</Button>
    <Button variant="secondary" className='material-shadow-none'>Right</Button>
</ButtonGroup>
`;

const GroupsizingButtonsExample = () => (
    <PrismCode
        code={groupSizingButtonsCode}
        language={("html")}
        plugins={["line-numbers"]}
    />
);

// Vertical Variation

const verticalButtonsCode =
    `<Row>
<div className="col-auto">
    <ButtonGroup className="material-shadow">
        <Button variant="primary" className='material-shadow-none'>1</Button>
        <Button variant="primary" className='material-shadow-none'>2</Button>
        <UncontrolledButtonDropdown id="btnGroupDrop1">
            <Dropdown.Toggle variant="primary" caret>
                Dropdown
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <DropdownItem> Dropdown link </DropdownItem>
                <DropdownItem> Dropdown link </DropdownItem>
            </Dropdown.Menu>
        </UncontrolledButtonDropdown>
    </ButtonGroup>
</div>
<div className="col-auto">
    <ButtonGroup className="material-shadow" vertical>
        <Button variant="light">Button</Button>

        <UncontrolledButtonDropdown id="btnGroupVerticalDrop1">
            <Dropdown.Toggle variant="light" caret>
                Dropdown
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <DropdownItem> Dropdown link </DropdownItem>
                <DropdownItem> Dropdown link </DropdownItem>
            </Dropdown.Menu>
        </UncontrolledButtonDropdown>

        <Button variant="light" className='material-shadow-none'>Button</Button>
        <Button variant="light" className='material-shadow-none'>Button</Button>
    </ButtonGroup>
</div>
<div className="col-auto">
    <ButtonGroup className="material-shadow" vertical>
        <Input type="radio" className="btn-check" name="vbtn" id="vbtn-radio1" defaultChecked="" />
        <Button variant="secondary" className='material-shadow-none' htmlFor="vbtn-radio1" outline>Radio 1</Button>
        <Input type="radio" className="btn-check" name="vbtn" id="vbtn-radio2" />
        <Button variant="secondary" className='material-shadow-none' htmlFor="vbtn-radio2" outline>Radio 2</Button>
        <Input type="radio" className="btn-check" name="vbtn" id="vbtn-radio3" />
        <Button variant="secondary" className='material-shadow-none' htmlFor="vbtn-radio3" outline>Radio 3</Button>
    </ButtonGroup>
</div>
</Row>
`;

const VerticalButtonsExample = () => (
    <PrismCode
        code={verticalButtonsCode}
        language={("html")}
        plugins={["line-numbers"]}
    />
);

// Ghost Buttons
const ghostButtonsCode =
    `
<!-- Ghost Buttons -->

<Button variant="outline-primary" className="material-shadow-none btn btn-ghost-primary">Primary</Button>

<Button variant="outline-secondary" className="material-shadow-none btn btn-ghost-secondary">Secondary</Button>

<Button variant="outline-success" className="material-shadow-none btn btn-ghost-success">Success</Button>

<Button variant="outline-info" className="material-shadow-none btn btn-ghost-info">Info</Button>

<Button variant="outline-warning" className="material-shadow-none btn btn-ghost-warning">Warning</Button>

<Button variant="outline-danger" className="material-shadow-none btn btn-ghost-danger">Danger</Button>

<Button variant="outline-dark" className="material-shadow-none btn btn-ghost-dark">Dark</Button>
`;

const GhostButtonsExample = () => (
    <PrismCode
        code={ghostButtonsCode}
        language={("html")}
        plugins={["line-numbers"]}
    />
);


// Ghost Buttons
const loadingbuttonsCode =
    `
<!-- Load More Buttons -->

<div className="hstack flex-wrap gap-2 mb-3 mb-lg-0">
    <Button variant="primary" className="btn-load" outline>
        <span className="d-flex align-items-center">
            <Spinner size="sm" className="flex-shrink-0"> Loading... </Spinner>
            <span className="flex-grow-1 ms-2">
                Loading...
            </span>
        </span>
    </Button>
    <Button variant="success" className="btn-load">
        <span className="d-flex align-items-center">
            <Spinner size="sm" className="flex-shrink-0"> Loading... </Spinner>
            <span className="flex-grow-1 ms-2">
                Loading...
            </span>
        </span>
    </Button>
    <Button variant="secondary" className="btn-load" outline>
        <span className="d-flex align-items-center">
            <Spinner size="sm" type="grow" className="flex-shrink-0"> Loading... </Spinner>
            <span className="flex-grow-1 ms-2">
                Loading...
            </span>
        </span>
    </Button>
    <Button variant="danger" className="btn-load">
        <span className="d-flex align-items-center">
            <Spinner size="sm" type="grow" className="flex-shrink-0"> Loading... </Spinner>
            <span className="flex-grow-1 ms-2">
                Loading...
            </span>
        </span>
    </Button>
</div>

<div className="d-flex flex-wrap gap-2 mb-3 mb-lg-0">
    <Button variant="primary" className="btn-load" outline>
        <span className="d-flex align-items-center">
            <span className="flex-grow-1 me-2">
                Loading...
            </span>
            <Spinner size="sm" className="flex-shrink-0" role="status"> Loading... </Spinner>
        </span>
    </Button>
    <Button variant="success" className="btn-load">
        <span className="d-flex align-items-center">
            <span className="flex-grow-1 me-2">
                Loading...
            </span>
            <Spinner size="sm" className="flex-shrink-0" role="status"> Loading... </Spinner>
        </span>
    </Button>
    <Button variant="warning" className="btn-load" outline>
        <span className="d-flex align-items-center">
            <span className="flex-grow-1 me-2">
                Loading...
            </span>
            <Spinner size="sm" type="grow" className="flex-shrink-0" role="status"> Loading... </Spinner>
        </span>
    </Button>
    <Button variant="info" className="btn-load">
        <span className="d-flex align-items-center">
            <span className="flex-grow-1 me-2">
                Loading...
            </span>
            <Spinner size="sm" type="grow" className="flex-shrink-0" role="status"> Loading... </Spinner>
        </span>
    </Button>
</div>
`;

const LoadingbuttonsExample = () => (
    <PrismCode
        code={loadingbuttonsCode}
        language={("html")}
        plugins={["line-numbers"]}
    />
);

// Border Buttons
const borderButtonsCode =
    `
<!-- Border Buttons -->

<div className="hstack flex-wrap gap-2 mb-3 mb-lg-0">
    <Button variant="primary" className="btn-border">Primary</Button>
    <Button variant="secondary" className="btn-border">Secondary</Button>
    <Button variant="success" className="btn-border">Success</Button>
    <Button variant="warning" className="btn-border">Warning</Button>
    <Button variant="danger" className="btn-border">Danger</Button>
</div>

<div className="hstack flex-wrap gap-2 mb-3 mb-lg-0">
    <Button variant="outline-primary" className="btn-border">Primary</Button>
    <Button variant="outline-secondary" className="btn-border">Secondary</Button>
    <Button variant="outline-success" className="btn-border">Success</Button>
    <Button className="btn-soft-warning btn-border">Warning</Button>
    <Button className="btn-soft-danger btn-border">Danger</Button>
    <Button className="btn-soft-dark btn-border">Dark</Button>
</div>
`;

const BorderButtonsExample = () => (
    <PrismCode
        code={borderButtonsCode}
        language={("html")}
        plugins={["line-numbers"]}
    />
);

// Custom Toggle Buttons
const customToggleButtonsCode =
    `
<!-- Custom Toggle Buttons -->

<div className="d-flex flex-wrap align-items-center gap-2">
    <Button variant='primary' className="custom-toggle active" onClick={(e) => favouriteBtn(e.target)}>
        <span className="icon-on"><i className="ri-alarm-line align-bottom"></i> Active</span>
        <span className="icon-off">Unactive</span>
    </Button>
    <Button variant='secondary' className="custom-toggle active" onClick={(e) => favouriteBtn(e.target)}>
        <span className="icon-on"><i className="ri-user-add-line align-bottom me-1"></i> Connect</span>
        <span className="icon-off"><i className="ri-check-fill align-bottom me-1"></i> Unconnect</span>
    </Button>
    <Button variant='success' className="custom-toggle" onClick={(e) => favouriteBtn(e.target)}>
        <span className="icon-on"><i className="ri-thumb-up-line align-bottom me-1"></i> Yes</span>
        <span className="icon-off"><i className="ri-thumb-down-line align-bottom me-1"></i> No</span>
    </Button>
    <Button variant='warning' className="custom-toggle active" onClick={(e) => favouriteBtn(e.target)}>
        <span className="icon-on"><i className="ri-add-line align-bottom me-1"></i> Follow</span>
        <span className="icon-off"><i className="ri-user-unfollow-line align-bottom me-1"></i> Unfollow</span>
    </Button>
    <Button variant='danger' className="custom-toggle" onClick={(e) => favouriteBtn(e.target)}>
        <span className="icon-on">On</span>
        <span className="icon-off">Off</span>
    </Button>
    <Button variant='dark' className="custom-toggle" onClick={(e) => favouriteBtn(e.target)}>
        <span className="icon-on"><i className="ri-bookmark-line align-bottom me-1"></i> Bookmark</span>
        <span className="icon-off"><i className="ri-bookmark-3-fill align-bottom me-1"></i> Unbookmark</span>
    </Button>
</div>

<div className="d-flex flex-wrap align-items-center gap-2">
    <Button variant="outline-primary" className="custom-toggle" onClick={(e) => favouriteBtn(e.target)}>
        <span className="icon-on">Active</span>
        <span className="icon-off">Unactive</span>
    </Button>
    <Button variant="outline-secondary" className="custom-toggle" onClick={(e) => favouriteBtn(e.target)}>
        <span className="icon-on"><i className="ri-add-line align-bottom me-1"></i> Follow</span>
        <span className="icon-off"><i className="ri-user-unfollow-line align-bottom me-1"></i> Unfollow</span>
    </Button>
    <Button variant="outline-success" className="custom-toggle active" onClick={(e) => favouriteBtn(e.target)}>
        <span className="icon-on">On</span>
        <span className="icon-off">Off</span>
    </Button>
    <Button variant="outline-warning" className="custom-toggle active" onClick={(e) => favouriteBtn(e.target)}>
        <span className="icon-on">Follow</span>
        <span className="icon-off">Unfollow</span>
    </Button>
    <Button variant="outline-danger" className="custom-toggle" onClick={(e) => favouriteBtn(e.target)}>
        <span className="icon-on">On</span>
        <span className="icon-off">Off</span>
    </Button>
    <Button variant="outline-dark" className="custom-toggle active" onClick={(e) => favouriteBtn(e.target)}>
        <span className="icon-on"><i className="ri-bookmark-line align-bottom"></i></span>
        <span className="icon-off"><i className="ri-bookmark-3-fill align-bottom"></i></span>
    </Button>
</div>
`;

const CustomToggleButtonsExample = () => (
    <PrismCode
        code={customToggleButtonsCode}
        language={("html")}
        plugins={["line-numbers"]}
    />
);

const baseclassButtonsCode =
`
<button type="button" className="btn">Base class</button>
`;

const BaseClassExample = () => (
    <PrismCode
        code={baseclassButtonsCode}
        language={("html")}
        plugins={["line-numbers"]}
    />
);

const customsizing =
`
<button type="button" className="btn btn-primary" style={{ '--tb-btn-padding-y': '.25rem', '--tb-btn-padding-x': '.5rem', '--tb-btn-font-size': '.75rem', }}>
    Custom button
</button>
`;

const CustomSizeExample = () => (
    <PrismCode
        code={customsizing}
        language={("html")}
        plugins={["line-numbers"]}
    />
);

const focusringcode =
`
<Link href="#!" className="d-inline-flex focus-ring py-1 px-2 text-decoration-none border rounded-2">
    Focus ring
</Link>

<Link href="#!" className="d-inline-flex focus-ring py-1 px-2 text-decoration-none border rounded-2" style={{ '--vz-focus-ring-color': 'rgba(118, 93, 255, .25)', }}>
    Custom focus ring
</Link>

<Link href="#!" className="d-inline-flex focus-ring py-1 px-2 text-decoration-none border rounded-2" style={{ '--vz-focus-ring-x': '10px', '--vz-focus-ring-y': '10px', '--vz-focus-ring-blur': '4px', }}>
    Blurry offset focus ring
</Link>
`;

const FocusRingExample = () => (
    <PrismCode
        code={focusringcode}
        language={("html")}
        plugins={["line-numbers"]}
    />
);

const focusringutility =
`
<p><Link href="#!" className="d-inline-flex focus-ring focus-ring-primary py-1 px-2 text-decoration-none border rounded-2">Primary focus</Link></p>

<p><Link href="#!" className="d-inline-flex focus-ring focus-ring-secondary py-1 px-2 text-decoration-none border rounded-2">Secondary focus</Link></p>

<p><Link href="#!" className="d-inline-flex focus-ring focus-ring-success py-1 px-2 text-decoration-none border rounded-2">Success focus</Link></p>

<p className="mb-lg-0"><Link href="#!" className="d-inline-flex focus-ring focus-ring-danger py-1 px-2 text-decoration-none border rounded-2">Danger focus</Link></p>

<p><Link href="#!" className="d-inline-flex focus-ring focus-ring-warning py-1 px-2 text-decoration-none border rounded-2">Warning focus</Link></p>

<p><Link href="#!" className="d-inline-flex focus-ring focus-ring-info py-1 px-2 text-decoration-none border rounded-2">Info focus</Link></p>

<p><Link href="#!" className="d-inline-flex focus-ring focus-ring-light py-1 px-2 text-decoration-none border rounded-2">Light focus</Link></p>

<p className="mb-0"><Link href="#!" className="d-inline-flex focus-ring focus-ring-dark py-1 px-2 text-decoration-none border rounded-2">Dark focus</Link></p>
`
const FocusRingUtilityExample = () => (
    <PrismCode
        code={focusringutility}
        language={("html")}
        plugins={["line-numbers"]}
    />
);


export { DefaultButtonsExample, OutlineButtonsExample, RoundedButtonsExample, SoftButtonsExample, GradientButtonsExample, AnimationButtonsExample, LabelButtonsExample, SizeButtonsExample, WidthButtonsExample, TagButtonsExample, GridButtonsExample, CheckButtonsExample, GroupButtonsExample, IconButtonsExample, ToolbarButtonsExample, GroupsizingButtonsExample, VerticalButtonsExample, GhostButtonsExample, LoadingbuttonsExample, BorderButtonsExample, CustomToggleButtonsExample, BaseClassExample, CustomSizeExample, FocusRingExample, FocusRingUtilityExample };