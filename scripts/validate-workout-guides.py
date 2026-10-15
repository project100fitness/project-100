"""Validate page counts, fillable field trees, appearances and readable renders."""
from pathlib import Path
import json, subprocess, tempfile
from pypdf import PdfReader
from PIL import Image, ImageOps, ImageDraw
root=Path("downloads/kinetics/pdf")
manifest=json.loads((root/"build-manifest.json").read_text())
thumbs=[]
for item in manifest["files"]:
    pdf=root/item["name"]
    reader=PdfReader(pdf)
    assert len(reader.pages)==item["pages"], item["name"]
    fields=reader.get_fields() or {}
    assert len(fields)==item["fields"], (item["name"],len(fields))
    widget_names=[]
    for page in reader.pages:
        assert page.extract_text().strip(), ("Empty page",item["name"])
        for ref in page.get("/Annots",[]):
            w=ref.get_object()
            if w.get("/Subtype")!="/Widget": continue
            assert w.get("/FT")=="/Tx"
            name=str(w["/T"]);widget_names.append(name)
            assert name in fields
            assert str(w.get("/V",""))==str(fields[name].get("/V",""))
            assert w.get("/AP",{}).get("/N") is not None
            assert w["/AP"]["/N"].get_object().get_data().strip()
            rect=list(map(float,w["/Rect"]))
            assert 0<=rect[0]<rect[2]<=596 and 30<=rect[1]<rect[3]<=842
    assert len(widget_names)==len(set(widget_names))==item["fields"]
    # Render every page with Poppler; malformed streams or font/image errors fail the job.
    with tempfile.TemporaryDirectory() as tmp:
        result=subprocess.run(["pdftoppm","-r","55","-png",str(pdf),str(Path(tmp)/"page")],capture_output=True,text=True)
        assert result.returncode==0, (item["name"],result.stderr)
        assert "Syntax Error" not in result.stderr, (item["name"],result.stderr)
        renders=sorted(Path(tmp).glob("page-*.png"))
        assert len(renders)==item["pages"]
        for render in renders:
            with Image.open(render) as im:
                assert im.width>100 and im.height>100
        pick=[renders[0]]
        if item["name"]=="planner-level-3.pdf": pick.extend([renders[2],renders[6],renders[-1]])
        if item["name"]=="exercise-guides.pdf": pick.append(renders[1])
        for render in pick:
            im=Image.open(render).convert("RGB")
            im.thumbnail((280,397))
            canvas=Image.new("RGB",(310,435),"#dfe5e8")
            canvas.paste(im,((310-im.width)//2,24))
            d=ImageDraw.Draw(canvas)
            d.text((9,7),item["name"]+" / "+render.stem,fill="#18232a")
            thumbs.append(canvas)
cols=4;rows=(len(thumbs)+cols-1)//cols
sheet=Image.new("RGB",(cols*310,rows*435),"#aebfc8")
for i,im in enumerate(thumbs):sheet.paste(im,((i%cols)*310,(i//cols)*435))
dest=Path("docs/workout-guides");dest.mkdir(parents=True,exist_ok=True)
sheet.save(dest/"pdf-review-v0.3.png")
(dest/"validation-v0.3.json").write_text(json.dumps({"status":"passed","pdfCount":len(manifest["files"]),"renderedPages":sum(f["pages"] for f in manifest["files"]),"checks":["page counts","fillable canonical field tree","unique widget names","field values","nonempty appearances","field bounds","all pages rendered with Poppler"]},indent=2)+"\n")
print("Validated",len(manifest["files"]),"PDFs and rendered all pages.")
