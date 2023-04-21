function Tabe(x, y, r, id, c){
    this.pos = createVector(x, y);
    this.r = r;
    this.speed = 320 / this.r;
    this.velocity = createVector(0,0);
    this.tabet = [];
    this.id = id;
    this.lawno = color(c.R, c.G, c.B);

    this.show = function(){
        fill(this.lawno);
        ellipse(this.pos.x, this.pos.y, this.r * 2);
    }

    this.update = function(worldBorder){
        let mx = mouseX;
        let my = mouseY;
        let pushback = 1;
        if(this.pos.x - this.r <= worldBorder.startX){
            mx = width/2 + pushback + (worldBorder.startX - (this.pos.x - this.r));
        }
        if(this.pos.x + this.r >= worldBorder.endX){
            mx = width/2 - pushback - ((this.pos.x + this.r) - worldBorder.endX);
        }
        if(this.pos.y - this.r <= worldBorder.startY){
            my = height/2 + pushback + (worldBorder.startY - (this.pos.y - this.r));
        }
        if(this.pos.y + this.r >= worldBorder.endY){
            my = height/2 - pushback - ((this.pos.y + this.r) - worldBorder.endY);
        }

        let newVelocity = createVector(mx - width/2, my - height/2);
        newVelocity.setMag(this.speed);
        this.velocity.lerp(newVelocity, 0.1);
        this.pos.add(this.velocity);

        socket.emit('player-moved', {
            id: this.id,
            x: this.pos.x,
            y: this.pos.y,
            r: this.r,
            c: {
                R: this.lawno.levels[0],
                G: this.lawno.levels[1],
                B: this.lawno.levels[2]
            }
        });
    }

    this.actualise = function(data){
        // let newVelocity = createVector(data.x, data.y);
        // newVelocity.setMag(this.speed);
        // this.velocity.lerp(newVelocity, 0.1);
        // this.pos.add(this.velocity);
        // this.r = lerp(this.r, data.r, 0.1);
        this.pos.x = data.x;
        this.pos.y = data.y;
        this.r = data.r;
    }

    this.eats = function(otherTabe){
        var d = p5.Vector.dist(this.pos, otherTabe.pos);

        if(d < (this.r)){
            let area = PI * sq(this.r);
            let otherArea = PI * sq(otherTabe.r);
            area += otherArea;
            this.r = sqrt(area / PI);
            this.speed = 320 / this.r;
            return true;
        }
        return false;
    }
}