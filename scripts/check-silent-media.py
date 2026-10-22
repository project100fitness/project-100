"""Published local video assets are silent by construction, including direct opens.

Inspect ISO media handlers without decoding or requiring ffmpeg in CI. Read atom
headers and the moov metadata only; skip potentially large mdat payloads.
"""
from pathlib import Path
import struct

ROOT=Path(__file__).resolve().parents[1]
VIDEO_SUFFIXES={'.mp4','.m4v','.mov'}
def boxes(f,start,end):
    pos=start
    while pos<end:
        assert pos+8<=end,('Truncated atom',pos)
        f.seek(pos);size,kind=struct.unpack('>I4s',f.read(8));header=8
        if size==1:
            assert pos+16<=end
            size=struct.unpack('>Q',f.read(8))[0];header=16
        if size==0:size=end-pos
        assert size>=header and pos+size<=end,('Invalid atom',kind,pos,size)
        yield kind,pos+header,pos+size
        pos+=size

def handlers(path):
    found=[]
    with path.open('rb') as f:
        def walk(start,end):
            for kind,a,b in boxes(f,start,end):
                if kind in {b'moov',b'trak',b'mdia'}:walk(a,b)
                elif kind==b'hdlr':
                    assert b-a>=12
                    f.seek(a+8);found.append(f.read(4))
        walk(0,path.stat().st_size)
    return found

def main():
    count=0
    for p in sorted((ROOT/'assets').rglob('*')):
        if not p.is_file():continue
        if p.suffix.lower() in VIDEO_SUFFIXES:
            found=handlers(p)
            assert b'vide' in found,('Missing video track',str(p.relative_to(ROOT)))
            assert b'soun' not in found,('Remove audio before publishing',str(p.relative_to(ROOT)))
            count+=1
        elif p.suffix.lower() in {'.webm','.mkv','.ogg','.mp3','.wav','.m4a','.aac','.opus'}:
            raise AssertionError(('Unverified audio/media asset; extend silent inspection before publishing',str(p.relative_to(ROOT))))
    assert count>0
    print(f'PASS: all {count} published local video assets contain video and no audio tracks.')

if __name__=='__main__':main()
