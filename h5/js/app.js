const content = `
    var wrapper = document.getElementById("signature-pad"),
        clearButton = wrapper.querySelector("[data-action=clear]"),
        saveButton = wrapper.querySelector("[data-action=save]"),
        canvas = wrapper.querySelector("canvas"),
        signaturePad;
    
    // Adjust canvas coordinate space taking into account pixel ratio,
    // to make it look crisp on mobile devices.
    // This also causes canvas to be cleared.
    function resizeCanvas() {
        // When zoomed out to less than 100%, for some very strange reason,
        // some browsers report devicePixelRatio as less than 1
        // and only part of the canvas is cleared then.
        var ratio =  Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
    }
    
    window.onresize = resizeCanvas;
    resizeCanvas();

    const defaultSignatureCanvasOptions = {
        backgroundColor: 'rgba(0,0,0,0)',
        imageDataType: 'image/png',
        encoderOptions: 0.92
    }

    const signatureOptions = {...defaultSignatureCanvasOptions, ...JSON.parse('<%canvasOptions%>' || '{}')}

    const postMessage = (message) => window.ReactNativeWebView.postMessage(JSON.stringify(message));

    var handleOnEnd = function(base64DataUrl) {
        postMessage({ type: 'ON_CHANGE', base64DataUrl });
    }
    
    signaturePad = new SignaturePad(canvas, {
        onEnd: () => handleOnEnd(signaturePad.toDataURL(signatureOptions.imageDataType, signatureOptions.encoderOptions)),
        backgroundColor: signatureOptions.backgroundColor
    });
    
    clearButton.addEventListener("click", function (event) {
        signaturePad.clear();
    });
    
    saveButton.addEventListener("click", function (event) {
        if (signaturePad.isEmpty()) {
            postMessage({ type: 'EMPTY' });
        } else {
            postMessage({ type: 'SAVE', base64DataUrl : signaturePad.toDataURL() });
        }
    });
`;

export default content;
