//var terrainFunction = new RoundFunction(0.5);
function RoundFunction(rad)
{
    this.rad_ = rad;
}

RoundFunction.prototype.isGround = function(position)
{
    return position.length() < this.rad_;
};

//var terrainFunction2 = new RadialFunction(1.07, random);
function RadialFunction(island_factor, rand)
{
    this.island_factor_ = island_factor;
    this.rand_ = rand;
    
    this.bumps_ = this.rand_.next(1, 6);
    this.bumps_ = Math.floor(this.bumps_);
    
    this.start_angle_ = this.rand_.next(0, 2*Math.PI);
    this.dip_angle_ = this.rand_.next(0, 2*Math.PI);
    this.dip_width_ = this.rand_.next(0.2, 0.7);
}

RadialFunction.prototype.isGround = function(pos)
{
    var angle = Math.atan2(pos.y, pos.x);
    var length = 0.5 * (Math.max(Math.abs(pos.x), Math.abs(pos.y)) + pos.length());

    var r1 = 0.5 + 0.4*Math.sin(this.start_angle_ + this.bumps_*angle + Math.cos((this.bumps_+3)*angle));
    var r2 = 0.7 - 0.2*Math.sin(this.start_angle_ + this.bumps_*angle - Math.sin((this.bumps_+2)*angle));
    
    if (Math.abs(angle - this.dip_angle_) < this.dip_width_
            || Math.abs(angle - this.dip_angle_ + 2 * Math.PI) < this.dip_width_
            || Math.abs(angle - this.dip_angle_ - 2 * Math.PI) < this.dip_width_)
    {
        r1 = r2 = 0.2;
    }

    return (length < r1 || (length > r1*this.island_factor_ && length < r2));
};

//lake island:new NoiseFunction(1, 0.702325296588242)
function NoiseFunction(skip, seed)
{
    if (seed === undefined)
    {
        seed = Math.random();
        console.log("Seed is: " + seed);
    }
    noise.seed(seed);
    this.skip_ = skip;
}

NoiseFunction.prototype.isGround = function(pos)
{
    var raw_noise = (noise.simplex2(pos.x*this.skip_, pos.y*this.skip_) + 1) / 2;
    return raw_noise > (0.3+0.9*Math.pow(pos.length(),3));
};


