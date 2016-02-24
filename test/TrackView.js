var TrackView = require("../TrackView");
var should = require('should');

describe("TrackView",() => {
    describe("isEqual", function() {
        it('should be equal', () => {
            let trackView1 = new TrackView({periodId: 0, adaptationSetId: 0, representationId: 0});
            let trackView2 = new TrackView({periodId: 0, adaptationSetId: 0, representationId: 0});
            trackView1.isEqual(trackView2).should.be.true();
        });
        it('should not be equal if representationId is different', () => {
            let trackView1 = new TrackView({periodId: 0, adaptationSetId: 0, representationId: 0});
            let trackView2 = new TrackView({periodId: 0, adaptationSetId: 0, representationId: 1});
            trackView1.isEqual(trackView2).should.be.false();
        });
        it('should not be equal if adaptationSetId is different', () => {
            let trackView1 = new TrackView({periodId: 0, adaptationSetId: 0, representationId: 0});
            let trackView2 = new TrackView({periodId: 0, adaptationSetId: 1, representationId: 0});
            trackView1.isEqual(trackView2).should.be.false();
        });
        it('should not be equal if periodId is different', () => {
            let trackView1 = new TrackView({periodId: 0, adaptationSetId: 0, representationId: 0});
            let trackView2 = new TrackView({periodId: 1, adaptationSetId: 0, representationId: 0});
            trackView1.isEqual(trackView2).should.be.false();
        });
    });
    describe("viewToString", function() {
        it('same tracks should have the same string output', () => {
            let trackView1 = new TrackView({periodId: 0, adaptationSetId: 0, representationId: 0});
            let trackView2 = new TrackView({periodId: 0, adaptationSetId: 0, representationId: 0});
            trackView1.viewToString().should.eql(trackView2.viewToString());
        });
        it('different track should have different output (representationId)', () => {
            let trackView1 = new TrackView({periodId: 0, adaptationSetId: 0, representationId: 0});
            let trackView2 = new TrackView({periodId: 0, adaptationSetId: 0, representationId: 1});
            trackView1.viewToString().should.not.eql(trackView2.viewToString());
        });
        it('different track should have different output (adaptationSetId)', () => {
            let trackView1 = new TrackView({periodId: 0, adaptationSetId: 0, representationId: 0});
            let trackView2 = new TrackView({periodId: 0, adaptationSetId: 1, representationId: 0});
            trackView1.viewToString().should.not.eql(trackView2.viewToString());
        });
        it('different track should have different output (periodId)', () => {
            let trackView1 = new TrackView({periodId: 0, adaptationSetId: 0, representationId: 0});
            let trackView2 = new TrackView({periodId: 1, adaptationSetId: 0, representationId: 0});
            trackView1.viewToString().should.not.eql(trackView2.viewToString());
        });
    });
});
