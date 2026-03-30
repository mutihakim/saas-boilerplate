import{j as e}from"./app-DJ9lNZKt.js";import{P as t}from"./Prism-5k6_z9Xj.js";const l=`
<!-- Slides Only -->
<UncontrolledCarousel
    controls={false}
    indicators={false}
    interval={3000}
    items={[
      {
        altText: " ",
        caption: " ",
        key: 1,
        src: img1,
      },
      {
        altText: " ",
        caption: " ",
        key: 2,
        src: img2,
      },
      {
        altText: " ",
        caption: " ",
        key: 3,
        src: img3,
      },
    ]}
  />
`,g=()=>e.jsx(t,{code:l,language:"html",plugins:["line-numbers"]}),a=`
<!-- With Controls -->
<UncontrolledCarousel
    interval={4000}
    indicators={false}
    items={[
      {
        altText: " ",
        caption: " ",
        key: 1,
        src: img1,
      },
      {
        altText: " ",
        caption: " ",
        key: 2,
        src: img2,
      },
      {
        altText: " ",
        caption: " ",
        key: 3,
        src: img3,
      },
    ]}
  />
`,p=()=>e.jsx(t,{code:a,language:"html",plugins:["line-numbers"]}),i=`
    <!-- With Indicators -->
<UncontrolledCarousel
  interval={4000}
    items={[
      {
        altText: " ",
        caption: " ",
        key: 1,
        src: img3,
      },
      {
        altText: " ",
        caption: " ",
        key: 2,
        src: img2,
      },
      {
        altText: " ",
        caption: " ",
        key: 3,
        src: img1,
      },
    ]}
  />
`,u=()=>e.jsx(t,{code:i,language:"html",plugins:["line-numbers"]}),n=`
    <!-- With Captions -->
<UncontrolledCarousel
    interval={4000}
    items={[
      {
        altText: "First slide label ",
        caption: "First slide label",
        key: 1,
        src: img7,
      },
      {
        altText: "Second slide label",
        caption: "Second slide label",
        key: 2,
        src: img2,
      },
      {
        altText: "Third slide label",
        caption: "Third slide label",
        key: 3,
        src: img9,
      },
    ]}
  />
`,x=()=>e.jsx(t,{code:n,language:"html",plugins:["line-numbers"]}),s=`
<!-- With Crossfade Animation -->
<UncontrolledCarousel
  interval={4000}
    items={[
      {
        altText: " ",
        caption: " ",
        key: 1,
        src: img1,
      },
      {
        altText: " ",
        caption: " ",
        key: 2,
        src: img2,
      },
      {
        altText: " ",
        caption: " ",
        key: 3,
        src: img3,
      },
    ]}
  />
`,k=()=>e.jsx(t,{code:s,language:"html",plugins:["line-numbers"]}),o=`
<!-- Individual Slide -->
<UncontrolledCarousel
    interval={4000}
    indicators={false}
    items={[
      {
        altText: " ",
        caption: " ",
        key: 1,
        src: img12,
      },
      {
        altText: " ",
        caption: " ",
        key: 2,
        src: img11,
      },
      {
        altText: " ",
        caption: " ",
        key: 3,
        src: img10,
      },
    ]}
  />
`,T=()=>e.jsx(t,{code:o,language:"html",plugins:["line-numbers"]}),c=`
<!-- Disable Touch Swiping -->
<UncontrolledCarousel
    interval={false}
    indicators={false}
    enableTouch={false}
    items={[
        {
            altText: " ",
            caption: " ",
            key: 1,
            src: img9,
        },
        {
            altText: " ",
            caption: " ",
            key: 2,
            src: img8,
        },
        {
            altText: " ",
            caption: " ",
            key: 3,
            src: img7,
        },
    ]}
/>
`,y=()=>e.jsx(t,{code:c,language:"html",plugins:["line-numbers"]}),r=`
    <!-- Dark Variant -->
<UncontrolledCarousel
    dark={true}
    interval={false}
    items={[
      {
        altText: " ",
        caption: "Drawing a sketch",
        key: 1,
        src: img1,
      },
      {
        altText: " ",
        caption: "Blue clock on a pastel background",
        key: 2,
        src: img2,
      },
      {
        altText: " ",
        caption: "Working at a coffee shop",
        key: 3,
        src: img3,
      },
    ]}
  />
`,h=()=>e.jsx(t,{code:r,language:"html",plugins:["line-numbers"]});export{k as CrossFadeExample,h as DarkVariantExample,y as DisableTouchExample,T as InduvidualIntervalExample,g as SlideOnlyExample,x as WithCaptionExample,p as WithControlExample,u as WithIndicatorExample};
