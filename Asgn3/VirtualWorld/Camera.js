class Camera{
    constructor(){
        this.eye = new Vector3([0,0,3]);
        this.at = new Vector3([0,0,-100]);
        this.up = new Vector3([0,1,0]);

        this.speed = 0.2;
    }

    forward() {
        var f = new Vector3(this.at.elements);
        f.sub(this.eye);
        f.normalize();
        f.mul(this.speed);

        this.eye.add(f);
        this.at.add(f);
    }

    back() {
        var f = new Vector3(this.eye.elements);
        f.sub(this.at);
        f.normalize();
        f.mul(this.speed);

        this.eye.add(f);
        this.at.add(f);
    }

    left() {
        var f = new Vector3(this.eye.elements);
        f.sub(this.at);
        f.normalize();

        var s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(this.speed);

        this.eye.add(s);
        this.at.add(s);
    }

    right() {
        var f = new Vector3(this.at.elements);
        f.sub(this.eye);
        f.normalize();

        var s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(this.speed);

        this.eye.add(s);
        this.at.add(s);
    }

    panLeft() {
        var f = new Vector3(this.at.elements);
        f.sub(this.eye);

        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(5, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        var f_prime = rotationMatrix.multiplyVector3(f);

        this.at = new Vector3(this.eye.elements);
        this.at.add(f_prime);
    }

    panRight() {
        var f = new Vector3(this.at.elements);
        f.sub(this.eye);

        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-5, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        var f_prime = rotationMatrix.multiplyVector3(f);

        this.at = new Vector3(this.eye.elements);
        this.at.add(f_prime);
    }

    panUp() {
        var f = new Vector3(this.at.elements);
        f.sub(this.eye);

        var side = Vector3.cross(f, this.up);
        side.normalize();

        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(5, side.elements[0], side.elements[1], side.elements[2]);

        var f_prime = rotationMatrix.multiplyVector3(f);

        this.at = new Vector3(this.eye.elements);
        this.at.add(f_prime);
    }

    panDown() {
        var f = new Vector3(this.at.elements);
        f.sub(this.eye);

        var side = Vector3.cross(f, this.up);
        side.normalize();

        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-5, side.elements[0], side.elements[1], side.elements[2]);

        var f_prime = rotationMatrix.multiplyVector3(f);

        this.at = new Vector3(this.eye.elements);
        this.at.add(f_prime);
    }
    
    getViewMatrix() {
        var viewMat = new Matrix4();

        viewMat.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );

        return viewMat;
    }

}