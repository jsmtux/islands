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
    return this.getValue(pos) > 0;
};

NoiseFunction.prototype.getValue = function(pos)
{
    var raw_noise = (noise.simplex2(pos.x*this.skip_, pos.y*this.skip_) + 1) / 2;
    var island_noise = raw_noise - (0.3+0.9*Math.pow(pos.length(),3));
    return island_noise;
};


