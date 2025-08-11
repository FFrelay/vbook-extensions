function execute() {
    return Response.success([
        { title: " Bản nhật xếp hạng ", input: "/other/rank_hits/order/hits_day.html", script: "gen.js" },
        { title: " Tuần này xếp hạng ", input: "/other/rank_hits/order/hits_week.html", script: "gen.js" },
        { title: " Tháng này xếp hạng ", input: "/other/rank_hits/order/hits_month.html", script: "gen.js" },
        { title: " Cuối cùng xếp hạng ", input: "/other/rank_hits/order/hits.html", script: "gen.js" },

    ]);
}