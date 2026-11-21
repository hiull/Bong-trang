// ShopScreen.js — Cửa hàng 3 tab: Thiết bị & Quầy tiệm / Trang trí & Thú cưng / Giao diện mùa.
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;

  BT.Screens.Shop = {
    mount(root, params, router) {
      const S = BT.Save.state;
      let tab = params.tab || "equip";
      const el = UI.el("div", "screen shop skin-" + S.activeSkin);
      const wallet = UI.el("div", "pill");
      el.appendChild(UI.topbar(UI.t("shopTitle"), () => router.back(), wallet));

      const tabs = UI.el("div", "shop-tabs");
      const tabDefs = [["equip", "🛠️ " + UI.t("shopTabEquip")], ["decor", "🪴 " + UI.t("shopTabDecor")], ["skin", "🎨 " + UI.t("shopTabSkin")]];
      const tabEls = {};
      tabDefs.forEach(([id, label]) => {
        const b = UI.el("button", "shop-tab", label);
        b.type = "button";
        b.addEventListener("click", () => { tab = id; BT.Audio.play("tap"); render(); });
        tabs.appendChild(b);
        tabEls[id] = b;
      });
      el.appendChild(tabs);

      // Xem trước mặt tiền
      const preview = UI.el("div", "shop-preview front");
      el.appendChild(preview);

      const list = UI.el("div", "shop-list");
      el.appendChild(list);
      root.appendChild(el);

      function pay(price, name) {
        if (S.wallet < price) { UI.toast(UI.t("lacking", { x: UI.money(price - S.wallet) })); BT.Audio.play("wrong"); return false; }
        S.wallet -= price;
        BT.Save.persist();
        BT.Audio.play("coin");
        UI.toast(UI.t("shopBought", { name }));
        return true;
      }

      function buyButton(price, onBuy) {
        const short = S.wallet < price;
        const b = UI.button(short ? UI.t("lacking", { x: UI.money(price - S.wallet) }) : UI.t("shopBuyPrice", { x: UI.money(price) }), "btn-green small", onBuy);
        if (short) b.classList.add("is-short");
        return b;
      }

      function item(icon, name, desc, right) {
        const row = UI.el("div", "shop-item");
        row.appendChild(UI.el("div", "shop-icon", icon));
        const info = UI.el("div", "shop-info");
        info.appendChild(UI.el("div", "shop-name", name));
        if (desc) info.appendChild(UI.el("div", "shop-desc", desc));
        row.appendChild(info);
        row.appendChild(right);
        list.appendChild(row);
        return info;
      }

      const equipIcons = { khay: "🍽️", bep: "🔥", bep_nhanh: "🪵", ghe: "🪑", quat: "🌀", nhac: "🎵", chong_chay: "🪭", lac_nhanh: "🛍️" };

      function render() {
        wallet.textContent = "🪙 " + UI.money(S.wallet);
        Object.keys(tabEls).forEach((k) => tabEls[k].classList.toggle("active", k === tab));
        preview.className = "shop-preview front skin-" + S.activeSkin;
        preview.innerHTML = "";
        preview.appendChild(UI.el("div", "awning"));
        preview.appendChild(UI.el("div", "lights"));
        preview.appendChild(UI.el("div", "menu-sign", window.PERSONAL.shopName));
        UI.decorateFront(preview);
        list.innerHTML = "";

        if (tab === "equip") {
          Object.keys(CONFIG.upgrades).forEach((id) => {
            const u = CONFIG.upgrades[id];
            const lv = S.upgrades[id];
            const step = lv - u.min;
            const max = lv >= u.max;
            const right = max ? UI.el("div", "shop-tag", UI.t("maxed")) : buyButton(u.prices[step], () => {
              if (!pay(u.prices[step], u.name)) return;
              S.upgrades[id] = lv + 1;
              BT.Save.persist();
              render();
            });
            const info = item(equipIcons[id] || "🛠️", u.name, u.desc, right);
            const dots = UI.el("div", "shop-level");
            for (let i = u.min; i < u.max; i++) dots.appendChild(UI.el("span", "lv-dot" + (i < lv ? " on" : "")));
            info.appendChild(dots);
          });
        }

        if (tab === "decor") {
          list.appendChild(UI.el("h3", "section-title", UI.t("shopDecorTitle")));
          CONFIG.decor.forEach((d) => {
            const own = S.decor.includes(d.id);
            const right = own ? UI.el("div", "shop-tag", UI.t("shopOwned")) : buyButton(d.price, () => {
              if (!pay(d.price, d.name)) return;
              S.decor.push(d.id);
              BT.Save.persist();
              render();
            });
            item(d.emoji, d.name, "", right);
          });
          list.appendChild(UI.el("h3", "section-title", UI.t("shopPetTitle")));
          Object.keys(CONFIG.pets).forEach((id) => {
            const p = CONFIG.pets[id];
            const own = S.pets.includes(id);
            const right = own ? UI.el("div", "shop-tag", UI.t("shopOwned")) : buyButton(p.price, () => {
              if (!pay(p.price, UI.fmt(p.name))) return;
              S.pets.push(id);
              BT.Save.persist();
              render();
            });
            item(p.emoji, UI.fmt(p.name), id === "miu" ? UI.t("shopDefaultPet") : "", right);
          });
        }

        if (tab === "skin") {
          const season = BT.Progress.seasonalSkin();
          if (season && S.activeSkin !== season.id) list.appendChild(UI.el("div", "shop-suggest", UI.t("shopSuggest", { name: season.name, icon: season.icon })));
          CONFIG.skins.forEach((k) => {
            const own = S.skins.includes(k.id);
            let right;
            if (S.activeSkin === k.id) right = UI.el("div", "shop-tag on", UI.t("shopInUse"));
            else if (own) right = UI.button(UI.t("shopUse"), "btn-pink small", () => { S.activeSkin = k.id; BT.Save.persist(); BT.Audio.play("tie"); render(); });
            else right = buyButton(k.price, () => {
              if (!pay(k.price, k.name)) return;
              S.skins.push(k.id);
              S.activeSkin = k.id;
              BT.Save.persist();
              render();
            });
            item(k.icon, k.name, UI.fmt(k.desc), right);
          });
        }
      }
      render();
      return { destroy() {} };
    }
  };
})();
