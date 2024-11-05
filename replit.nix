{ pkgs }: {
  deps = [
    pkgs.wget
    pkgs.unzipNLS
   pkgs.nix-output-monitor
    pkgs.nodejs-18_x
    pkgs.nodePackages.typescript-language-server
    pkgs.yarn
  ];
}