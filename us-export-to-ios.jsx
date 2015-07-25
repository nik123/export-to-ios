// Photoshop variables
var docRef = app.activeDocument,
    activeLayer = docRef.activeLayer,
    activeLayer2,
    newWidth, 
    newHeight,
    docNameNoExt = filenameNoExt(docRef.name);

var scaleFactors = {
    '@3x': 1,
    '@2x': 1.5,
    '@1x': 3,
};

// Run main function
init();

function init() {
    if(!isDocumentNew()) {
        for(var dpi in scaleFactors) {
           saveFunc(dpi);
        }
    } else {
        alert("Please save your document before running this script.");
    }
}

function filenameNoExt(filename) {
    //Locate the final position of the final . before the extension.
    var dotPos = filename.lastIndexOf( "." ) ;

    if ( dotPos > -1 ) {
        
        return filename.substr( 0 , dotPos );
    }
    
    //if dotPos is more than -1 then filename does not contain extension
    return filename;
}

// Test if the document is new (unsaved)
// http://2.adobe-photoshop-scripting.overzone.net/determine-if-file-has-never-been-saved-in-javascript-t264.html
function isDocumentNew(doc){
    // assumes doc is the activeDocument
    cTID = function(s) { return app.charIDToTypeID(s); }
    var ref = new ActionReference();
    ref.putEnumerated( cTID("Dcmn"),
    cTID("Ordn"),
    cTID("Trgt") ); //activeDoc
    var desc = executeActionGet(ref);
    var rc = true;
        if (desc.hasKey(cTID("FilR"))) { //FileReference
        var path = desc.getPath(cTID("FilR"));
        
        if (path) {
            rc = (path.absoluteURI.length == 0);
        }
    }
    return rc;
}

function saveFunc(dpi) {
    app.activeDocument = docRef;
    duplicateImage(false);
    resizeActiveDoc(dpi);

    var path = docRef.path; 
    var folder = Folder(path + '/' + docNameNoExt + '-assets/');
    if(!folder.exists) {
        folder.create();
    }
    // Name the new asset
    var saveFile = File(folder + "/" + docNameNoExt + (dpi === '@1x' ? '' : dpi) + ".png");

    var sfwOptions = new ExportOptionsSaveForWeb(); 
        sfwOptions.format = SaveDocumentType.PNG; 
        sfwOptions.includeProfile = false; 
        sfwOptions.interlaced = 0; 
        sfwOptions.optimized = true; 
        sfwOptions.quality = 100;
        sfwOptions.PNG8 = false;

    // Export the layer as a PNG
    activeDocument.exportDocument(saveFile, ExportType.SAVEFORWEB, sfwOptions);

    // Close the document without saving
    activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}

// Duplicate image. Merged shows if layers groups should be merged
function duplicateImage(merged) {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Dcmn'), cTID('Ordn'), cTID('Frst'));
    desc1.putReference(cTID('null'), ref1);
    if (merged) {desc1.putBoolean(cTID('Mrgd'), true);}
    executeAction(cTID('Dplc'), desc1, DialogModes.NO);
}

function resizeActiveDoc(scale) {
    // get a reference to the current (active) document and store it in a variable named "doc"
    doc = app.activeDocument;

    // change the color mode to RGB.  Important for resizing GIFs with indexed colors, to get better results
    doc.changeMode(ChangeMode.RGB);  

    // these are our values for the end result width and height (in pixels) of our image
    var newHeight = Math.floor(app.activeDocument.height / scaleFactors[scale]);
    var newWidth = Math.floor(app.activeDocument.width / scaleFactors[scale]);

    // do the resizing.  if height > width (portrait-mode) resize based on height.  otherwise, resize based on width
    if (doc.height > doc.width) {
        doc.resizeImage(null,UnitValue(newHeight,"px"),null,ResampleMethod.BICUBIC);
    }
    else {
        doc.resizeImage(UnitValue(newWidth,"px"),null,null,ResampleMethod.BICUBIC);
    }
}